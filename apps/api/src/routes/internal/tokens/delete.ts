import type { Request, Response } from 'express';

import logger from '@hey/helpers/logger';
import heyPg from 'src/db/heyPg';
import catchedError from 'src/helpers/catchedError';
import validateIsStaff from 'src/helpers/middlewares/validateIsStaff';
import validateLensAccount from 'src/helpers/middlewares/validateLensAccount';
import { delRedis } from 'src/helpers/redisClient';
import { invalidBody, noBody } from 'src/helpers/responses';
import { object, string } from 'zod';

type ExtensionRequest = {
  id: string;
};

const validationSchema = object({
  id: string()
});

export const post = [
  validateLensAccount,
  validateIsStaff,
  async (req: Request, res: Response) => {
    const { body } = req;

    if (!body) {
      return noBody(res);
    }

    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
      return invalidBody(res);
    }

    const { id } = body as ExtensionRequest;

    try {
      await heyPg.query(`DELETE FROM "AllowedToken" WHERE id = $1`, [id]);
      await delRedis(`allowedTokens`);
      logger.info(`Deleted a token ${id}`);

      return res.status(200).json({ success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
