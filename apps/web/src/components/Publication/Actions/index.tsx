import type { AnyPublication } from '@hey/lens';
import type { FC } from 'react';

import { useApolloClient } from '@apollo/client';
import getPublicationViewCountById from '@hey/helpers/getPublicationViewCountById';
import isOpenActionAllowed from '@hey/helpers/isOpenActionAllowed';
import { isMirrorPublication } from '@hey/helpers/publicationHelpers';
import stopEventPropagation from '@hey/helpers/stopEventPropagation';
import { useNewPublicationStatsSubscriptionSubscription } from '@hey/lens';
import { memo } from 'react';
import { useImpressionsStore } from 'src/store/non-persisted/useImpressionsStore';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import OpenAction from '../OpenAction';
import Comment from './Comment';
import Like from './Like';
import Mod from './Mod';
import ShareMenu from './Share';
import Tip from './Tip';
import Views from './Views';

interface PublicationActionsProps {
  publication: AnyPublication;
  showCount?: boolean;
}

const PublicationActions: FC<PublicationActionsProps> = ({
  publication,
  showCount = false
}) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { currentProfile } = useProfileStore();
  const { gardenerMode } = useFeatureFlagsStore();
  const { publicationViews } = useImpressionsStore();

  const { cache } = useApolloClient();

  const hasOpenAction = (targetPublication.openActionModules?.length || 0) > 0;

  const canMirror = currentProfile
    ? targetPublication.operations.canMirror
    : true;
  const canAct =
    hasOpenAction && isOpenActionAllowed(targetPublication.openActionModules);
  const canTip = currentProfile?.id !== targetPublication.by.id;
  const views = getPublicationViewCountById(
    publicationViews,
    targetPublication.id
  );

  useNewPublicationStatsSubscriptionSubscription({
    onData: ({ data }) => {
      if (data.data?.newPublicationStats) {
        cache.modify({
          fields: {
            reactions: () => data.data?.newPublicationStats.reactions || 0
          },
          id: `PublicationStats:${data.data?.newPublicationStats.id}`
        });
      }
    },
    skip: !targetPublication.id,
    variables: { for: targetPublication.id }
  });

  return (
    <span
      className="-ml-2 mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 sm:gap-8"
      onClick={stopEventPropagation}
    >
      <Comment publication={targetPublication} showCount={showCount} />
      {canMirror ? (
        <ShareMenu publication={targetPublication} showCount={showCount} />
      ) : null}
      <Like publication={targetPublication} showCount={showCount} />
      {canAct ? (
        <OpenAction publication={targetPublication} showCount={showCount} />
      ) : null}
      {canTip ? (
        <Tip publication={targetPublication} showCount={showCount} />
      ) : null}
      {views > 0 ? <Views showCount={showCount} views={views} /> : null}
      {gardenerMode ? (
        <Mod isFullPublication={showCount} publication={targetPublication} />
      ) : null}
    </span>
  );
};

export default memo(PublicationActions);
