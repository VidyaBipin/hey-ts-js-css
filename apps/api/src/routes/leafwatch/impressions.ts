import type { Request, Response } from 'express';

import logger from '@hey/helpers/logger';
import requestIp from 'request-ip';
import catchedError from 'src/helpers/catchedError';
import createClickhouseClient from 'src/helpers/createClickhouseClient';
import { rateLimiter } from 'src/helpers/middlewares/rateLimiter';
import { invalidBody, noBody } from 'src/helpers/responses';
import urlcat from 'urlcat';
import { array, object, string } from 'zod';

type ExtensionRequest = {
  ids: string[];
  viewer_id: string;
};

const validationSchema = object({
  ids: array(string()),
  viewer_id: string()
});

export const post = [
  rateLimiter({ requests: 100, within: 1 }),
  async (req: Request, res: Response) => {
    const { body } = req;

    if (!body) {
      return noBody(res);
    }

    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
      return invalidBody(res);
    }

    const ip = requestIp.getClientIp(req);
    const { ids, viewer_id } = body as ExtensionRequest;

    try {
      let ipData: {
        city: string;
        country: string;
        regionName: string;
      } | null = null;

      try {
        const ipResponse = await fetch(
          urlcat('https://pro.ip-api.com/json/:ip', {
            ip,
            key: process.env.IPAPI_KEY
          })
        );
        ipData = await ipResponse.json();
      } catch (error) {
        return catchedError(res, error);
      }

      const values = ids.map((id) => ({
        city: ipData?.city || null,
        country: ipData?.country || null,
        ip: ip || null,
        publication_id: id,
        region: ipData?.regionName || null,
        viewer_id
      }));

      const client = createClickhouseClient();
      const result = await client.insert({
        format: 'JSONEachRow',
        table: 'impressions',
        values
      });
      logger.info(
        `Ingested ${result.summary?.result_rows} impressions to Leafwatch`
      );

      return res.status(200).json({ id: result.query_id, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
