import type { Handler } from 'express';

import logger from '@hey/helpers/logger';
import heyPg from 'src/db/heyPg';
import catchedError from 'src/helpers/catchedError';
import {
  CACHE_AGE_30_MINS,
  STAFF_PICK_FEATURE_ID
} from 'src/helpers/constants';
import {
  generateMediumExpiry,
  getRedis,
  setRedis
} from 'src/helpers/redisClient';

const getRandomPicks = (data: any[]) => {
  const random = data.sort(() => Math.random() - Math.random());
  return random.slice(0, 150);
};

export const get: Handler = async (_, res) => {
  try {
    const cacheKey = `staff-picks`;
    const cachedData = await getRedis(cacheKey);

    if (cachedData) {
      logger.info('(cached) Staff picks fetched');
      return res.status(200).json({
        result: getRandomPicks(JSON.parse(cachedData)),
        success: true
      });
    }

    const data = await heyPg.query(
      `
        SELECT "profileId" FROM "ProfileFeature"
        WHERE enabled = TRUE AND "featureId" = $1;
      `,
      [STAFF_PICK_FEATURE_ID]
    );

    await setRedis(cacheKey, data, generateMediumExpiry());
    logger.info('Staff picks fetched');

    return res
      .status(200)
      .setHeader('Cache-Control', CACHE_AGE_30_MINS)
      .json({ result: getRandomPicks(data), success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};
