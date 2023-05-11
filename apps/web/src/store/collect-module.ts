import { DEFAULT_COLLECT_TOKEN } from 'data/constants';
import type { RecipientDataInput } from 'lens';
import { CollectModules } from 'lens';
import { create } from 'zustand';

export type CollectModuleType = {
  type: CollectModules;
  isTimedFeeCollect?: boolean;
  isFreeCollect?: boolean;
  isFeeCollect?: boolean;
  isRevertCollect?: boolean;
  isLimitedFeeCollect?: boolean;
  isLimitedTimeFeeCollect?: boolean;
  isMultiRecipientFeeCollect?: boolean;
  amount?: { currency?: string; value: string };
  referralFee?: number;
  collectLimit?: string | null;
  timeLimit?: boolean;
  followerOnlyCollect?: boolean;
  recipients?: RecipientDataInput[];
  multiRecipients?: RecipientDataInput[];
};

interface CollectModuleState {
  selectedCollectModule: CollectModules;
  setSelectedCollectModule: (selectedModule: CollectModules) => void;
  amount: null | string;
  setAmount: (amount: null | string) => void;
  selectedCurrency: null | string;
  setSelectedCurrency: (selectedCurrency: null | string) => void;
  referralFee: null | string;
  setReferralFee: (referralFee: null | string) => void;
  collectLimit: null | string;
  setCollectLimit: (collectLimit: null | string) => void;
  hasTimeLimit: boolean;
  setHasTimeLimit: (hasTimeLimit: boolean) => void;
  recipients: { recipient: string; split: number }[];
  setRecipients: (recipients: { recipient: string; split: number }[]) => void;
  followerOnly: boolean;
  setFollowerOnly: (followerOnly: boolean) => void;
  payload: any;
  setPayload: (payload: any) => void;
  reset: () => void;
  collectModule: CollectModuleType;
  setCollectModule: (collectModule: CollectModuleType) => void;
}

export const useCollectModuleStore = create<CollectModuleState>((set) => ({
  selectedCollectModule: CollectModules.RevertCollectModule,
  setSelectedCollectModule: (selectedCollectModule) =>
    set(() => ({ selectedCollectModule })),
  amount: null,
  setAmount: (amount) => set(() => ({ amount })),
  selectedCurrency: DEFAULT_COLLECT_TOKEN,
  setSelectedCurrency: (selectedCurrency) => set(() => ({ selectedCurrency })),
  referralFee: null,
  setReferralFee: (referralFee) => set(() => ({ referralFee })),
  collectLimit: null,
  setCollectLimit: (collectLimit) => set(() => ({ collectLimit })),
  hasTimeLimit: false,
  setHasTimeLimit: (hasTimeLimit) => set(() => ({ hasTimeLimit })),
  recipients: [],
  setRecipients: (recipients) => set(() => ({ recipients })),
  followerOnly: false,
  setFollowerOnly: (followerOnly) => set(() => ({ followerOnly })),
  payload: { revertCollectModule: true },
  setPayload: (payload) => set(() => ({ payload })),
  reset: () =>
    set(() => ({
      selectedCollectModule: CollectModules.RevertCollectModule,
      amount: null,
      selectedCurrency: DEFAULT_COLLECT_TOKEN,
      referralFee: null,
      collectLimit: null,
      hasTimeLimit: false,
      followerOnly: false,
      payload: { revertCollectModule: true }
    })),

  collectModule: {
    type: CollectModules.RevertCollectModule,
    amount: { currency: DEFAULT_COLLECT_TOKEN, value: '' },
    referralFee: 0,
    collectLimit: null,
    timeLimit: false,
    recipients: [],
    followerOnlyCollect: false
  },
  setCollectModule: (collectModule) => set(() => ({ collectModule }))
}));
