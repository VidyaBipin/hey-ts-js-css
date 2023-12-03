import { ArrowPathIcon, UsersIcon } from '@heroicons/react/24/outline';
import type { ExploreProfilesRequest, Profile } from '@hey/lens';
import {
  CustomFiltersType,
  ExploreProfilesOrderByType,
  LimitType,
  useExploreProfilesQuery
} from '@hey/lens';
import getProfile from '@hey/lib/getProfile';
import { Card, EmptyState, ErrorMessage } from '@hey/ui';
import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Loader from '@/components/Shared/Loader';
import SearchUser from '@/components/Shared/SearchUser';
import UserProfile from '@/components/Shared/UserProfile';

const List: FC = () => {
  const push = useNavigate();
  const [value, setValue] = useState('');

  // Variables
  const request: ExploreProfilesRequest = {
    where: { customFilters: [CustomFiltersType.Gardeners] },
    orderBy: ExploreProfilesOrderByType.LatestCreated,
    limit: LimitType.TwentyFive
  };

  const { data, loading, error, refetch } = useExploreProfilesQuery({
    variables: { request }
  });

  const profiles = data?.exploreProfiles.items;

  return (
    <Card>
      <div className="flex items-center justify-between space-x-5 p-5">
        <SearchUser
          value={value}
          placeholder="Search profiles..."
          onChange={(event) => setValue(event.target.value)}
          onProfileSelected={(profile) => push(getProfile(profile).staffLink)}
        />
        <button onClick={() => refetch()}>
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="divider" />
      <div className="p-5">
        {loading ? (
          <Loader message="Loading profiles..." />
        ) : error ? (
          <ErrorMessage title="Failed to load profiles" error={error} />
        ) : !profiles?.length ? (
          <EmptyState
            message={<span>No profiles</span>}
            icon={<UsersIcon className="text-brand-500 h-8 w-8" />}
            hideCard
          />
        ) : (
          <div className="space-y-5">
            {profiles?.map((profile) => (
              <div key={profile.id}>
                <Link to={getProfile(profile as Profile).staffLink}>
                  <UserProfile
                    profile={profile as Profile}
                    isBig
                    showUserPreview={false}
                    showBio
                    linkToProfile={false}
                    timestamp={profile.createdAt}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default List;
