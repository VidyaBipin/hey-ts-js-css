import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { APP_NAME } from '@hey/data/constants';
import { PAGEVIEW } from '@hey/data/tracking';
import {
  Card,
  GridItemEight,
  GridItemFour,
  GridLayout,
  TabButton
} from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import { useEffect, useState } from 'react';
import useProfileStore from 'src/store/persisted/useProfileStore';

import SettingsSidebar from '../Sidebar';
import CollectModules from './CollectModules';
import OpenActions from './OpenActions';

enum Type {
  COLLECT_MODULES = 'COLLECT_MODULES',
  OPEN_ACTIONS = 'OPEN_ACTIONS'
}

const AllowanceSettings: NextPage = () => {
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const [type, setType] = useState<Type>(Type.COLLECT_MODULES);

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'settings', subpage: 'allowance' });
  }, []);

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Allowance settings • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsSidebar />
      </GridItemFour>
      <GridItemEight>
        <Card className="p-5">
          <div className="flex items-center gap-x-6">
            <TabButton
              active={type === Type.COLLECT_MODULES}
              name="Collect & Follow Modules"
              onClick={() => setType(Type.COLLECT_MODULES)}
            />
            <TabButton
              active={type === Type.OPEN_ACTIONS}
              name="Open Actions"
              onClick={() => setType(Type.OPEN_ACTIONS)}
            />
          </div>
          {type === Type.COLLECT_MODULES && <CollectModules />}
          {type === Type.OPEN_ACTIONS && <OpenActions />}
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default AllowanceSettings;
