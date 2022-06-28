import { gql, useLazyQuery, useMutation } from '@apollo/client'
import SwitchNetwork from '@components/Shared/SwitchNetwork'
import { CURRENT_USER_QUERY } from '@components/SiteLayout'
import { Button } from '@components/UI/Button'
import { Spinner } from '@components/UI/Spinner'
import { Profile } from '@generated/types'
import { XCircleIcon } from '@heroicons/react/solid'
import consoleLog from '@lib/consoleLog'
import getWalletLogo from '@lib/getWalletLogo'
import clsx from 'clsx'
import Cookies from 'js-cookie'
import React, { Dispatch, FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { COOKIE_CONFIG } from 'src/apollo'
import { CHAIN_ID, ERROR_MESSAGE } from 'src/constants'
import { useAppStore, usePersistStore } from 'src/store'
import {
  Connector,
  useAccount,
  useConnect,
  useNetwork,
  useSignMessage
} from 'wagmi'

const CHALLENGE_QUERY = gql`
  query Challenge($request: ChallengeRequest!) {
    challenge(request: $request) {
      text
    }
  }
`

export const AUTHENTICATE_MUTATION = gql`
  mutation Authenticate($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
  }
`

interface Props {
  setHasConnected: Dispatch<boolean>
  setHasProfile: Dispatch<boolean>
}

const WalletSelector: FC<Props> = ({ setHasConnected, setHasProfile }) => {
  const [mounted, setMounted] = useState(false)
  const { chain } = useNetwork()
  const { signMessageAsync, isLoading: signLoading } = useSignMessage()
  const [
    loadChallenge,
    { error: errorChallenege, loading: challenegeLoading }
  ] = useLazyQuery(CHALLENGE_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      consoleLog(
        'Lazy Query',
        '#8b5cf6',
        `Fetched auth challenege - ${data?.challenge?.text}`
      )
    }
  })
  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(AUTHENTICATE_MUTATION)
  const [getProfiles, { error: errorProfiles, loading: profilesLoading }] =
    useLazyQuery(CURRENT_USER_QUERY, {
      onCompleted(data) {
        consoleLog(
          'Lazy Query',
          '#8b5cf6',
          `Fetched ${data?.profiles?.items?.length} user profiles for auth`
        )
      }
    })

  useEffect(() => setMounted(true), [])

  const { connectors, error, connectAsync } = useConnect()
  const { address, connector: activeConnector } = useAccount()
  const { setProfiles } = useAppStore()
  const { setIsAuthenticated, setCurrentUser } = usePersistStore()

  const onConnect = async (connector: Connector) => {
    await connectAsync({ connector }).then(({ account }) => {
      if (account) {
        setHasConnected(true)
      }
    })
  }

  const handleSign = () => {
    loadChallenge({
      variables: { request: { address } }
    }).then((res) => {
      if (!res?.data?.challenge?.text) {
        return toast.error(ERROR_MESSAGE)
      }

      signMessageAsync({ message: res?.data?.challenge?.text }).then(
        (signature) => {
          authenticate({
            variables: { request: { address, signature } }
          }).then((res) => {
            Cookies.set(
              'accessToken',
              res.data.authenticate.accessToken,
              COOKIE_CONFIG
            )
            Cookies.set(
              'refreshToken',
              res.data.authenticate.refreshToken,
              COOKIE_CONFIG
            )
            getProfiles({
              variables: { ownedBy: address }
            }).then(({ data }) => {
              if (data?.profiles?.items?.length === 0) {
                setHasProfile(false)
              } else {
                const profiles: Profile[] = data?.profiles?.items
                  ?.slice()
                  ?.sort(
                    (a: Profile, b: Profile) => Number(a.id) - Number(b.id)
                  )
                  ?.sort((a: Profile, b: Profile) =>
                    !(a.isDefault !== b.isDefault) ? 0 : a.isDefault ? -1 : 1
                  )
                setIsAuthenticated(true)
                setProfiles(profiles)
                setCurrentUser(profiles[0])
              }
            })
          })
        }
      )
    })
  }

  return activeConnector?.id ? (
    <div className="space-y-3">
      {chain?.id === CHAIN_ID ? (
        <Button
          size="lg"
          disabled={
            signLoading || challenegeLoading || authLoading || profilesLoading
          }
          icon={
            signLoading ||
            challenegeLoading ||
            authLoading ||
            profilesLoading ? (
              <Spinner className="mr-0.5" size="xs" />
            ) : (
              <img
                className="mr-1 w-5 h-5"
                height={20}
                width={20}
                src="/lens.png"
                alt="Lens Logo"
              />
            )
          }
          onClick={handleSign}
        >
          Sign-In with Lens
        </Button>
      ) : (
        <SwitchNetwork />
      )}
      {(errorChallenege || errorAuthenticate || errorProfiles) && (
        <div className="flex items-center space-x-1 font-bold text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{ERROR_MESSAGE}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="inline-block overflow-hidden space-y-3 w-full text-left align-middle transition-all transform">
      {connectors.map((connector) => {
        return (
          <button
            type="button"
            key={connector.id}
            className={clsx(
              {
                'hover:bg-gray-100 dark:hover:bg-gray-700':
                  connector.id !== activeConnector?.id
              },
              'w-full flex items-center space-x-2.5 justify-center px-4 py-3 overflow-hidden rounded-xl border dark:border-gray-700/80 outline-none'
            )}
            onClick={() => onConnect(connector)}
            disabled={
              mounted
                ? !connector.ready || connector.id === activeConnector?.id
                : false
            }
          >
            <span className="flex justify-between items-center w-full">
              {mounted
                ? connector.id === 'injected'
                  ? 'Browser Wallet'
                  : connector.name
                : connector.name}
              {mounted ? !connector.ready && ' (unsupported)' : ''}
            </span>
            <img
              src={getWalletLogo(connector.name)}
              draggable={false}
              className="w-6 h-6"
              height={24}
              width={24}
              alt={connector.id}
            />
          </button>
        )
      })}
      {error?.message ? (
        <div className="flex items-center space-x-1 text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{error?.message ?? 'Failed to connect'}</div>
        </div>
      ) : null}
    </div>
  )
}

export default WalletSelector
