import type { Club } from '@hey/types/club';
import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import NewPost from '@components/Composer/Post/New';
import Cover from '@components/Shared/Cover';
import { getAuthApiHeadersWithAccessToken } from '@helpers/getAuthApiHeaders';
import isFeatureAvailable from '@helpers/isFeatureAvailable';
import { Leafwatch } from '@helpers/leafwatch';
import { APP_NAME, HEY_API_URL, STATIC_IMAGES_URL } from '@hey/data/constants';
import { PAGEVIEW } from '@hey/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@hey/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import Details from './Details';
import Feed from './Feed';
import Members from './Members';
import ClubPageShimmer from './Shimmer';

const ViewClub: NextPage = () => {
  const {
    isReady,
    pathname,
    query: { handle }
  } = useRouter();
  const { currentProfile } = useProfileStore();

  const showMembers = pathname === '/c/[handle]/members';

  useEffect(() => {
    if (isReady) {
      Leafwatch.track(PAGEVIEW, {
        page: 'club',
        subpage: pathname.replace('/c/[handle]', '')
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  const getClub = async (handle: string): Promise<Club | null> => {
    try {
      const response = await axios.post(
        `${HEY_API_URL}/clubs/get`,
        { club_handle: handle, profile_id: currentProfile?.id },
        { headers: getAuthApiHeadersWithAccessToken() }
      );

      return response.data.data.items?.[0];
    } catch {
      return null;
    }
  };

  const {
    data: club,
    error,
    isLoading: clubLoading
  } = useQuery({
    enabled: Boolean(handle),
    queryFn: () => getClub(handle as string),
    queryKey: ['getClub', handle]
  });

  if (!isFeatureAvailable('clubs')) {
    return null;
  }

  if (!isReady || clubLoading) {
    return <ClubPageShimmer profileList={showMembers} />;
  }

  if (!club) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  return (
    <>
      <MetaTags
        description={club.description}
        title={`${club.name} (/${club.handle}) • ${APP_NAME}`}
      />
      <Cover cover={club.cover || `${STATIC_IMAGES_URL}/patterns/2.svg`} />
      <GridLayout>
        <GridItemFour>
          <Details club={club} />
        </GridItemFour>
        <GridItemEight className="space-y-5">
          {showMembers ? (
            <Members clubId={club.id} handle={club.handle} />
          ) : (
            <>
              {currentProfile && club.isMember && (
                <NewPost
                  tags={[
                    `orbcommunities${club.handle}`,
                    `heyclubs${club.handle}`
                  ]}
                />
              )}
              <Feed handle={club.handle} />
            </>
          )}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewClub;
