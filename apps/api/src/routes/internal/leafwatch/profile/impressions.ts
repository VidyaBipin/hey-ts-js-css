import type { Request, Response } from 'express';

import logger from '@hey/helpers/logger';
import catchedError from 'src/helpers/catchedError';
import createClickhouseClient from 'src/helpers/createClickhouseClient';
import validateIsStaff from 'src/helpers/middlewares/validateIsStaff';
import validateLensAccount from 'src/helpers/middlewares/validateLensAccount';
import { noBody } from 'src/helpers/responses';

export const get = [
  validateLensAccount,
  validateIsStaff,
  async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id) {
      return noBody(res);
    }

    try {
      const client = createClickhouseClient();
      const rows = await client.query({
        format: 'JSONEachRow',
        query: `
        WITH toYear(now()) AS current_year
        SELECT
          day,
          impressions,
          totalImpressions
        FROM (
          SELECT
            toDayOfYear(viewed_at) AS day,
            count() AS impressions
          FROM impressions
          WHERE splitByString('-', publication_id)[1] = '${id}'
            AND toYear(viewed_at) = current_year
          GROUP BY day
        ) AS dailyImpressions
        CROSS JOIN (
          SELECT count() AS totalImpressions
          FROM impressions
          WHERE splitByString('-', publication_id)[1] = '${id}'
            AND toYear(viewed_at) = current_year
        ) AS total
        ORDER BY day
      `
      });

      const result = await rows.json<{
        day: number;
        impressions: number;
        totalImpressions: number;
      }>();
      logger.info(`Profile impressions fetched for ${id}`);

      return res.status(200).json({
        success: true,
        totalImpressions: Number(result[0]?.totalImpressions),
        yearlyImpressions: result.map((row) => ({
          day: row.day,
          impressions: Number(row.impressions)
        }))
      });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
