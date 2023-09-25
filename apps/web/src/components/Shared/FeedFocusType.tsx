import { EXPLORE } from '@hey/data/tracking';
import { PublicationMainFocus } from '@hey/lens';
import cn from '@hey/ui/cn';
import { Leafwatch } from '@lib/leafwatch';
import { t } from '@lingui/macro';
import type { Dispatch, FC, SetStateAction } from 'react';

interface FeedLinkProps {
  name: string;
  type?: PublicationMainFocus;
}

interface FeedFocusTypeProps {
  focus?: PublicationMainFocus;
  setFocus: Dispatch<SetStateAction<PublicationMainFocus | undefined>>;
}

const FeedFocusType: FC<FeedFocusTypeProps> = ({ focus, setFocus }) => {
  const FeedLink: FC<FeedLinkProps> = ({ name, type }) => (
    <button
      type="button"
      onClick={() => {
        setFocus(type as PublicationMainFocus);
        Leafwatch.track(EXPLORE.SWITCH_EXPLORE_FEED_FOCUS, {
          explore_feed_focus: (type ?? 'all_posts').toLowerCase()
        });
      }}
      className={cn(
        { '!bg-brand-500 !text-white': focus === type },
        'text-brand rounded-full px-3 py-1.5 text-xs sm:px-4',
        'border-brand-300 dark:border-brand-500 border',
        'bg-brand-100 dark:bg-brand-300/20'
      )}
      aria-label={name}
      aria-selected={focus === type}
      data-testid={`feed-type-${(type ?? 'all_posts').toLowerCase()}`}
    >
      {name}
    </button>
  );

  return (
    <div className="mt-3 flex flex-wrap gap-3 px-5 sm:mt-0 sm:px-0">
      <FeedLink name={t`All posts`} />
      <FeedLink name={t`Text`} type={PublicationMainFocus.TextOnly} />
      <FeedLink name={t`Video`} type={PublicationMainFocus.Video} />
      <FeedLink name={t`Audio`} type={PublicationMainFocus.Audio} />
      <FeedLink name={t`Images`} type={PublicationMainFocus.Image} />
    </div>
  );
};

export default FeedFocusType;
