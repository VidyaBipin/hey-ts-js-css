import ToggleWithHelper from '@components/Shared/ToggleWithHelper';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import type { FC } from 'react';
import { useCollectModuleStore } from 'src/store/collect-module';

interface FollowersConfigProps {
  setCollectType: (data: any) => void;
}

const FollowersConfig: FC<FollowersConfigProps> = ({ setCollectType }) => {
  const collectModule = useCollectModuleStore((state) => state.collectModule);

  return (
    <div className="pt-5">
      <ToggleWithHelper
        on={collectModule.followerOnly || false}
        setOn={() =>
          setCollectType({ followerOnly: !collectModule.followerOnly })
        }
        heading={t`Who can collect`}
        description={t`Only followers can collect`}
        icon={<UserGroupIcon className="h-4 w-4" />}
      />
    </div>
  );
};

export default FollowersConfig;
