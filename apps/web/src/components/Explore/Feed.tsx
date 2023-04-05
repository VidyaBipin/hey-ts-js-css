import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { CollectionIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import type { ExplorePublicationRequest, Publication, PublicationMainFocus } from 'lens';
import { CustomFiltersTypes, PublicationSortCriteria, useExploreFeedQuery } from 'lens';
import type { FC } from 'react';
import { useState } from 'react';
import { useInView } from 'react-cool-inview';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { useAppStore } from 'src/store/app';
import { Card, EmptyState, ErrorMessage } from 'ui';

interface FeedProps {
  focus?: PublicationMainFocus;
  feedType?: PublicationSortCriteria;
}

const Feed: FC<FeedProps> = ({ focus, feedType = PublicationSortCriteria.CuratedProfiles }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [hasMore, setHasMore] = useState(true);

  // Variables
  const request: ExplorePublicationRequest = {
    sortCriteria: feedType,
    noRandomize: feedType === 'LATEST',
    customFilters: [CustomFiltersTypes.Gardeners],
    metadata: focus ? { mainContentFocus: [focus] } : null,
    limit: 10
  };
  const reactionRequest = currentProfile ? { profileId: currentProfile?.id } : null;
  const profileId = currentProfile?.id ?? null;

  const { data, loading, error, fetchMore } = useExploreFeedQuery({
    variables: { request, reactionRequest, profileId }
  });

  const publications = data?.explorePublications?.items;
  const pageInfo = data?.explorePublications?.pageInfo;

  const { observe } = useInView({
    onChange: async ({ inView }) => {
      if (!inView || !hasMore) {
        return;
      }

      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next }, reactionRequest, profileId }
      }).then(({ data }) => {
        setHasMore(data?.explorePublications?.items?.length > 0);
      });
    }
  });

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (publications?.length === 0) {
    return <EmptyState message={t`No posts yet!`} icon={<CollectionIcon className="text-brand h-8 w-8" />} />;
  }

  if (error) {
    return <ErrorMessage title={t`Failed to load explore feed`} error={error} />;
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height || '100%'}
          width={width || '100%'}
          itemData={publications}
          itemCount={publications?.length || 0}
          itemSize={50}
        >
          {({ data }) => (
            <Card className="divide-y-[1px] dark:divide-gray-700" dataTestId="explore-feed">
              {data?.map((publication, index) => (
                <div key={index}>
                  <SinglePublication
                    key={`${publication.id}_${index}`}
                    publication={publication as Publication}
                  />
                </div>
              ))}
              {hasMore && <span ref={observe} />}
            </Card>
          )}
        </List>
      )}
    </AutoSizer>
  );
};

export default Feed;
