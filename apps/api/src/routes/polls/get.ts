import type { Handler } from 'express';

import logger from '@hey/helpers/logger';
import parseJwt from '@hey/helpers/parseJwt';
import catchedError from 'src/helpers/catchedError';
import prisma from 'src/helpers/prisma';
import { getRedis, setRedis } from 'src/helpers/redisClient';
import { noBody } from 'src/helpers/responses';

export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }

  try {
    const cacheKey = `poll:${id}`;
    const cachedData = await getRedis(cacheKey);

    if (cachedData) {
      logger.info(`(cached) Poll fetched`);
      return res
        .status(200)
        .json({ result: JSON.parse(cachedData), success: true });
    }

    const identityToken = req.headers['x-identity-token'] as string;
    const payload = parseJwt(identityToken);

    const data = await prisma.poll.findUnique({
      select: {
        endsAt: true,
        id: true,
        options: {
          orderBy: { index: 'asc' },
          select: {
            _count: { select: { responses: true } },
            id: true,
            option: true,
            responses: {
              select: { id: true },
              where: { profileId: payload.id }
            }
          }
        }
      },
      where: { id: id as string }
    });

    if (!data) {
      return res.status(400).json({ error: 'Poll not found.', success: false });
    }

    const totalResponses = data.options.reduce(
      (acc, option) => acc + option._count.responses,
      0
    );

    const sanitizedData = {
      endsAt: data.endsAt,
      id: data.id,
      options: data.options.map((option) => ({
        id: option.id,
        option: option.option,
        percentage:
          totalResponses > 0
            ? (option._count.responses / totalResponses) * 100
            : 0,
        responses: option._count.responses,
        voted: option.responses.length > 0
      }))
    };

    await setRedis(cacheKey, sanitizedData);
    logger.info('Poll fetched');

    return res.status(200).json({ result: sanitizedData, success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};
