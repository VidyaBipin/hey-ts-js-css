import type { Club } from '@hey/types/club';

import { getAuthApiHeadersWithAccessToken } from '@helpers/getAuthApiHeaders';
import { HEY_API_URL } from '@hey/data/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

const SUGGESTION_LIST_LENGTH_LIMIT = 5;

export type ClubProfile = {
  displayHandle: string;
  handle: string;
  id: string;
  name: string;
  picture: string;
};

const useClubQuery = (query: string): ClubProfile[] => {
  const { currentProfile } = useProfileStore();
  const [results, setResults] = useState<ClubProfile[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    axios
      .post(
        `${HEY_API_URL}/clubs/get`,
        { limit: 10, profile_id: currentProfile?.id, query },
        { headers: getAuthApiHeadersWithAccessToken() }
      )
      .then(({ data }) => {
        const search = data.data;
        const clubSearchResult = search;
        const clubs = clubSearchResult?.items as Club[];
        const clubsResults = (clubs ?? []).map(
          (club): ClubProfile => ({
            displayHandle: `/${club.handle}`,
            handle: club.handle,
            id: club.id,
            name: club.name,
            picture: club.logo
          })
        );

        setResults(clubsResults.slice(0, SUGGESTION_LIST_LENGTH_LIMIT));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return results;
};

export default useClubQuery;
