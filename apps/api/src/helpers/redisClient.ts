import hoursToSeconds from '@hey/helpers/hoursToSeconds';
import logger from '@hey/helpers/logger';
import randomNumber from '@hey/helpers/randomNumber';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('connect', () => logger.info('[Redis] Redis connect'));
redisClient.on('ready', () => logger.info('[Redis] Redis ready'));
redisClient.on('reconnecting', (err) =>
  logger.error('[Redis] Redis reconnecting', err)
);
redisClient.on('error', (err) => logger.error('[Redis] Redis error', err));
redisClient.on('end', (err) => logger.error('[Redis] Redis end', err));

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.info('[Redis] REDIS_URL not set');
    return;
  }

  logger.info('[Redis] Connecting to Redis');
  await redisClient.connect();
};

connectRedis().catch((error) =>
  logger.error('[Redis] Connection error', error)
);

// Generates a random expiry time between 1 and 3 hours
export const generateMediumExpiry = (): number => {
  return randomNumber(hoursToSeconds(1), hoursToSeconds(3));
};

// Generates a random expiry time between 4 and 8 hours
export const generateLongExpiry = (): number => {
  return randomNumber(hoursToSeconds(4), hoursToSeconds(8));
};

// Generates a random expiry time between 9 and 24 hours
const generateExtraLongExpiry = (): number => {
  return randomNumber(hoursToSeconds(9), hoursToSeconds(24));
};

export const setRedis = async (
  key: string,
  value: boolean | number | Record<string, any> | string,
  expiry = generateExtraLongExpiry()
) => {
  if (typeof value !== 'string') {
    value = JSON.stringify(value);
  }

  return await redisClient.set(key, value, { EX: expiry });
};

export const getRedis = async (key: string) => {
  return await redisClient.get(key);
};

export const delRedis = async (key: string) => {
  await redisClient.del(key);
};

export const getTtl = async (key: string) => {
  return await redisClient.ttl(key);
};

export default redisClient;
