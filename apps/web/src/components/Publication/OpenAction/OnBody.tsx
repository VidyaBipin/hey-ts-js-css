import type {
  MirrorablePublication,
  UnknownOpenActionModuleSettings
} from '@hey/lens';
import type { FC } from 'react';

import { VerifiedOpenActionModules } from '@hey/data/verified-openaction-modules';

import DecentOpenAction from './UnknownModule/Decent';
import SwapOpenAction from './UnknownModule/Swap';

interface OpenActionOnBodyProps {
  publication: MirrorablePublication;
}

const OpenActionOnBody: FC<OpenActionOnBodyProps> = ({ publication }) => {
  const module = publication.openActionModules
    .filter((module) => module.__typename === 'UnknownOpenActionModuleSettings')
    .find(
      (module) =>
        module.contract.address === VerifiedOpenActionModules.Swap ||
        module.contract.address === VerifiedOpenActionModules.DecentNFT
    );

  if (!module) {
    return null;
  }

  return (
    <div className="mt-3">
      {module.contract.address === VerifiedOpenActionModules.Swap && (
        <SwapOpenAction
          module={module as UnknownOpenActionModuleSettings}
          publication={publication}
        />
      )}
      {module.contract.address === VerifiedOpenActionModules.DecentNFT && (
        <DecentOpenAction publication={publication} />
      )}
    </div>
  );
};

export default OpenActionOnBody;
