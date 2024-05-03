import type { Amount } from '@hey/lens';
import type { UIData } from 'nft-openaction-kit';
import type { FC } from 'react';

import LoginButton from '@components/Shared/Navbar/LoginButton';
import MetaDetails from '@components/Shared/Staff/MetaDetails';
import { LinkIcon } from '@heroicons/react/24/outline';
import stopEventPropagation from '@hey/helpers/stopEventPropagation';
import { Button, Spinner } from '@hey/ui';
import cn from '@hey/ui/cn';
import Link from 'next/link';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { openActionCTA } from '.';

interface DecentActionProps {
  act: () => void;
  allowanceLoading?: boolean;
  className?: string;
  isLoading?: boolean;
  isReadyToMint?: boolean;
  loadingCurrency?: boolean;
  moduleAmount?: Amount;
  txHash?: string;
  uiData?: UIData;
}

const DecentAction: FC<DecentActionProps> = ({
  act,
  allowanceLoading,
  className = '',
  isLoading = false,
  isReadyToMint,
  loadingCurrency,
  moduleAmount,
  txHash,
  uiData
}) => {
  const { address } = useAccount();

  const amount = parseInt(moduleAmount?.value || '0');
  const assetAddress = moduleAmount?.asset?.contract.address;
  const assetDecimals = moduleAmount?.asset?.decimals || 18;
  const assetSymbol = moduleAmount?.asset?.symbol;
  const loadingState: boolean = isLoading;

  const { data: balanceData } = useBalance({
    address,
    query: { refetchInterval: 2000 },
    token: assetAddress
  });

  let hasAmount = false;
  if (
    balanceData &&
    parseFloat(formatUnits(balanceData.value, assetDecimals)) < amount
  ) {
    hasAmount = false;
  } else {
    hasAmount = true;
  }

  if (!address) {
    return (
      <div className="w-full">
        <LoginButton isBig isFullWidth title="Login to Mint" />
      </div>
    );
  }

  if (loadingCurrency) {
    return (
      <div
        className={cn(
          'shimmer flex h-[34px] w-28 items-center justify-center rounded-lg',
          className
        )}
      >
        <p>Switching currencies</p>
      </div>
    );
  }

  if (allowanceLoading) {
    return (
      <div className={cn('shimmer h-[34px] w-28 rounded-lg', className)} />
    );
  }

  if (!hasAmount) {
    return (
      <Button
        className="w-full border-gray-300 bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600"
        disabled={true}
        size="lg"
      >
        {`Insufficient ${assetSymbol} balance`}
      </Button>
    );
  }

  return (
    <>
      <Button
        className={className}
        disabled={loadingState}
        icon={loadingState ? <Spinner size="xs" /> : null}
        onClick={(e) => {
          stopEventPropagation(e);
          act();
        }}
      >
        <div>
          {loadingState
            ? 'Pending'
            : !isReadyToMint
              ? `Approve ${moduleAmount?.value} ${moduleAmount?.asset.symbol}`
              : `${openActionCTA(uiData?.platformName)} for ${moduleAmount?.value} ${moduleAmount?.asset.symbol}`}
        </div>
      </Button>
      {txHash ? (
        <>
          <MetaDetails
            icon={<LinkIcon className="ld-text-gray-500 size-4" />}
            title="PolygonScan"
            value={`https://polygonscan.com/tx/${txHash}`}
          >
            <Link
              href={`https://polygonscan.com/tx/${txHash}`}
              rel="noreferrer"
              target="_blank"
            >
              Open
            </Link>
          </MetaDetails>
          <MetaDetails
            icon={<LinkIcon className="ld-text-gray-500 size-4" />}
            title="LayerZeroScan"
            value={`https://layerzeroscan.com/tx/${txHash}`}
          >
            <Link
              href={`https://layerzeroscan.com/tx/${txHash}`}
              rel="noreferrer"
              target="_blank"
            >
              Open
            </Link>
          </MetaDetails>
        </>
      ) : null}
    </>
  );
};

export default DecentAction;
