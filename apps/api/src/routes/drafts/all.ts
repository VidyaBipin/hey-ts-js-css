import type { Request, Response } from 'express';

import logger from '@hey/helpers/logger';
import parseJwt from '@hey/helpers/parseJwt';
import heyPg from 'src/db/heyPg';
import catchedError from 'src/helpers/catchedError';
import validateLensAccount from 'src/helpers/middlewares/validateLensAccount';

// TODO: add tests
export const get = [
  validateLensAccount,
  async (req: Request, res: Response) => {
    try {
      const identityToken = req.headers['x-identity-token'] as string;
      const payload = parseJwt(identityToken);

      const result = await heyPg.query(
        `
        SELECT *
        FROM "DraftPublication"
        WHERE "profileId" = $1
        ORDER BY "updatedAt" DESC;
      `,
        [payload.id]
      );

      logger.info(`Drafts fetched for ${payload.id}`);

      return res.status(200).json({ result, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
