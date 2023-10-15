import { BellIcon } from '@heroicons/react/24/outline';
import type {
  CommentNotification as CommentNotificationType,
  FollowNotification as FollowNotificationType,
  MirrorNotification as MirrorNotificationType,
  NotificationRequest,
  QuoteNotification as QuoteNotificationType,
  ReactionNotification as ReactionNotificationType
} from '@hey/lens';
import {
  CustomFiltersType,
  NotificationType,
  useNotificationsQuery
} from '@hey/lens';
import { Card, EmptyState, ErrorMessage } from '@hey/ui';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { NotificationTabType } from 'src/enums';
import { usePreferencesStore } from 'src/store/preferences';

import NotificationShimmer from './Shimmer';
import CommentNotification from './Type/CommentNotification';
import FollowNotification from './Type/FollowNotification';
import MirrorNotification from './Type/MirrorNotification';
import QuoteNotification from './Type/QuoteNotification';
import ReactionNotification from './Type/ReactionNotification';

interface ListProps {
  feedType: string;
}

const List: FC<ListProps> = ({ feedType }) => {
  const highSignalNotificationFilter = usePreferencesStore(
    (state) => state.highSignalNotificationFilter
  );

  const getNotificationType = () => {
    switch (feedType) {
      case NotificationTabType.All:
        return;
      case NotificationTabType.Mentions:
        return [NotificationType.Mentioned];
      case NotificationTabType.Comments:
        return [NotificationType.Commented];
      case NotificationTabType.Likes:
        return [NotificationType.Reacted];
      case NotificationTabType.Collects:
        return [NotificationType.Acted];
      default:
        return;
    }
  };

  // Variables
  const request: NotificationRequest = {
    where: {
      customFilters: [CustomFiltersType.Gardeners],
      highSignalFilter: highSignalNotificationFilter,
      notificationTypes: getNotificationType()
    }
  };

  const { data, loading, error, fetchMore } = useNotificationsQuery({
    variables: { request }
  });

  const notifications = data?.notifications?.items;
  const pageInfo = data?.notifications?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (!hasMore) {
      return;
    }

    await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next } }
    });
  };

  if (loading) {
    return (
      <Card className="divide-y dark:divide-gray-700">
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
        <NotificationShimmer />
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-3"
        title="Failed to load notifications"
        error={error}
      />
    );
  }

  if (notifications?.length === 0) {
    return (
      <EmptyState
        message="Inbox zero!"
        icon={<BellIcon className="text-brand h-8 w-8" />}
        hideCard
      />
    );
  }

  return (
    <Card>
      <Virtuoso
        useWindowScroll
        className="virtual-notification-list"
        data={notifications}
        endReached={onEndReached}
        itemContent={(_, notification) => {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5"
            >
              {notification.__typename === 'FollowNotification' ? (
                <FollowNotification
                  notification={notification as FollowNotificationType}
                />
              ) : null}
              {/* {notification.__typename === 'MentionNotification' ? (
                <MentionNotification
                  notification={notification as MentionNotificationType}
                />
              ) : null} */}
              {notification.__typename === 'ReactionNotification' ? (
                <ReactionNotification
                  notification={notification as ReactionNotificationType}
                />
              ) : null}
              {notification.__typename === 'CommentNotification' ? (
                <CommentNotification
                  notification={notification as CommentNotificationType}
                />
              ) : null}
              {notification.__typename === 'MirrorNotification' ? (
                <MirrorNotification
                  notification={notification as MirrorNotificationType}
                />
              ) : null}
              {notification.__typename === 'QuoteNotification' ? (
                <QuoteNotification
                  notification={notification as QuoteNotificationType}
                />
              ) : null}
              {/* {notification.__typename === 'ActedNotification' ? (
                <CollectNotification
                  notification={notification as ActedNotificationType}
                />
              ) : null} */}
            </motion.div>
          );
        }}
      />
    </Card>
  );
};

export default List;
