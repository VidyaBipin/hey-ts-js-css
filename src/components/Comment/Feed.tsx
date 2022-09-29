import { gql, useQuery } from '@apollo/client';
import QueuedPublication from '@components/Publication/QueuedPublication';
import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { Card } from '@components/UI/Card';
import { EmptyState } from '@components/UI/EmptyState';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import { Spinner } from '@components/UI/Spinner';
import { LensterPublication } from '@generated/lenstertypes';
import { CustomFiltersTypes } from '@generated/types';
import { CommentFields } from '@gql/CommentFields';
import { CollectionIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import React, { FC } from 'react';
import { useInView } from 'react-cool-inview';
import { PAGINATION_ROOT_MARGIN } from 'src/constants';
import { useAppStore } from 'src/store/app';
import { useTransactionPersistStore } from 'src/store/transaction';
import { PAGINATION } from 'src/tracking';

import CommentWarning from '../Shared/CommentWarning';
import NewComment from './New';

const COMMENT_FEED_QUERY = gql`
  query CommentFeed(
    $request: PublicationsQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publications(request: $request) {
      items {
        ... on Comment {
          ...CommentFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${CommentFields}
`;

interface Props {
  publication: LensterPublication;
}

const Feed: FC<Props> = ({ publication }) => {
  const pubId = publication?.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id;
  const currentProfile = useAppStore((state) => state.currentProfile);
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);

  // Variables
  const request = { commentsOf: pubId, customFilters: [CustomFiltersTypes.Gardeners], limit: 10 };
  const reactionRequest = currentProfile ? { profileId: currentProfile?.id } : null;
  const profileId = currentProfile?.id ?? null;

  const { data, loading, error, fetchMore } = useQuery(COMMENT_FEED_QUERY, {
    variables: { request, reactionRequest, profileId },
    skip: !pubId
  });

  const comments = data?.publications?.items;
  const pageInfo = data?.publications?.pageInfo;

  const { observe } = useInView({
    onChange: async ({ inView }) => {
      if (!inView) {
        return;
      }

      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next }, reactionRequest, profileId }
      });
      Mixpanel.track(PAGINATION.COMMENT_FEED);
    },
    rootMargin: PAGINATION_ROOT_MARGIN
  });

  const queuedCount = txnQueue.filter((o) => o.type === 'NEW_COMMENT').length;
  const totalComments = comments?.length + queuedCount;
  const canComment = publication?.canComment?.result;

  return (
    <>
      {currentProfile ? canComment ? <NewComment publication={publication} /> : <CommentWarning /> : null}
      {loading && <PublicationsShimmer />}
      {totalComments === 0 && (
        <EmptyState
          message={<span>Be the first one to comment!</span>}
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load comment feed" error={error} />
      {!error && !loading && totalComments !== 0 && (
        <>
          <Card className="divide-y-[1px] dark:divide-gray-700/80">
            {txnQueue.map(
              (txn) =>
                txn?.type === 'NEW_COMMENT' &&
                txn?.parent === publication?.id && (
                  <div key={txn.id}>
                    <QueuedPublication txn={txn} />
                  </div>
                )
            )}
            {comments?.map((post: LensterPublication, index: number) => (
              <SinglePublication key={`${pubId}_${index}`} publication={post} showType={false} />
            ))}
          </Card>
          {pageInfo?.next && comments?.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </>
      )}
    </>
  );
};

export default Feed;
