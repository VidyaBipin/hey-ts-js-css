import UserProfile from '@components/Shared/UserProfile';
import { Input } from '@components/UI/Input';
import { Spinner } from '@components/UI/Spinner';
import type { Profile } from '@generated/types';
import { CustomFiltersTypes, SearchRequestTypes, useSearchProfilesLazyQuery } from '@generated/types';
import { Menu, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { ChevronDownIcon } from '@heroicons/react/solid';
import getAvatar from '@lib/getAvatar';
import { Leafwatch } from '@lib/leafwatch';
import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import React, { Fragment, useState } from 'react';
import { useAppStore } from 'src/store/app';
import { useTimelineStore } from 'src/store/timeline';
import { SEARCH } from 'src/tracking';

const SeeThroughLens = () => {
  const [searchText, setSearchText] = useState('');
  const seeThroughProfile = useTimelineStore((state) => state.seeThroughProfile);
  const setSeeThroughProfile = useTimelineStore((state) => state.setSeeThroughProfile);
  const currentProfile = useAppStore((state) => state.currentProfile);

  const profile = seeThroughProfile ?? currentProfile;

  const [searchUsers, { data: searchUsersData, loading: searchUsersLoading }] = useSearchProfilesLazyQuery();

  const handleSearch = (evt: ChangeEvent<HTMLInputElement>) => {
    const keyword = evt.target.value;
    setSearchText(keyword);
    searchUsers({
      variables: {
        request: {
          type: SearchRequestTypes.Profile,
          query: keyword,
          customFilters: [CustomFiltersTypes.Gardeners],
          limit: 5
        }
      }
    });
  };

  // @ts-ignore
  const profiles = searchUsersData?.search?.items ?? [];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-md hover:bg-gray-300 p-1 hover:bg-opacity-20">
        <span className="flex space-x-1 items-center text-sm">
          <img
            src={getAvatar(profile)}
            loading="lazy"
            className="bg-gray-200 w-5 h-5 rounded-full border dark:border-gray-700/80"
            alt={profile?.handle}
          />
          <span>{seeThroughProfile ? `@${profile?.handle}` : 'My Feed'}</span>
          <ChevronDownIcon className="w-5 h-5" />
        </span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className="absolute w-64 right-0 p-2 z-[5] mt-1 bg-white rounded-xl border shadow-sm dark:bg-gray-900 focus:outline-none dark:border-gray-700/80"
        >
          <div className="text-xs px-1 mb-2">👀 See the feed through someone else</div>
          <Input
            type="text"
            className="py-2 px-3 text-sm"
            placeholder="Search"
            value={searchText}
            autoFocus
            autoComplete="off"
            iconRight={
              <XIcon
                className={clsx('cursor-pointer', searchText ? 'visible' : 'invisible')}
                onClick={() => {
                  setSearchText('');
                  Leafwatch.track(SEARCH.CLEAR);
                }}
              />
            }
            onChange={handleSearch}
          />
          <div className="my-2">
            {searchUsersLoading ? (
              <div className="py-2 px-4 space-y-2 text-sm font-bold text-center">
                <Spinner size="sm" className="mx-auto" />
                <div>Searching users</div>
              </div>
            ) : (
              <>
                {profiles.map((profile: Profile) => (
                  <Menu.Item
                    as="div"
                    className={({ active }) =>
                      clsx(
                        { 'dropdown-active': active },
                        'flex rounded-lg overflow-hidden gap-1 space-x-1 items-center cursor-pointer p-1'
                      )
                    }
                    key={profile?.handle}
                    onClick={() => {
                      setSeeThroughProfile(profile);
                      setSearchText('');
                    }}
                  >
                    <UserProfile showUserPreview={false} linkToProfile={false} profile={profile} />
                  </Menu.Item>
                ))}
                {profiles.length === 0 && <div className="py-4 text-center">No matching users</div>}
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SeeThroughLens;
