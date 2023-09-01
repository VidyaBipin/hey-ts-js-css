import type { OpenSeaNft } from '@lenster/types/opensea-nft';

import getNftMetadata from './getNftMetadata';

export const regex = /https:\/\/opensea.io\/assets\/([^/]+)\/([^/]+)\/([^/]+)/;

const getOpenseaNft = async (url: string): Promise<OpenSeaNft | null> => {
  if (regex.test(url)) {
    const matches = regex.exec(url);

    if (matches?.length === 4) {
      const chain = matches[1];
      const contract = matches[2];
      const token = matches[3];

      return await getNftMetadata(chain, contract, token);
    }

    return null;
  }

  return null;
};

export default getOpenseaNft;
