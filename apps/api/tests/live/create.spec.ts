import getAuthWorkerHeadersForTest from '@hey/lib/getAuthWorkerHeadersForTest';
import { TEST_URL } from '@utils/constants';
import axios from 'axios';
import { describe, expect, test } from 'vitest';

describe('live/create', () => {
  test('should return created live stream', async () => {
    const response = await axios.post(
      `${TEST_URL}/live/create`,
      { record: true },
      { headers: await getAuthWorkerHeadersForTest() }
    );

    expect(response.data.result.createdByTokenName).toEqual('Hey Live');
  });
});
