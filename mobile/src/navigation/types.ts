import type { Transaction, Profile } from '../lib/api';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Transfer: { recipient?: Profile } | undefined;
  TopUp: undefined;
  MyQR: undefined;
  Scan: undefined;
  PayConfirm: { payeeId: string; payeeName?: string };
  Success: {
    transaction?: Transaction;
    title?: string;
    subtitle?: string;
    amount?: number;
  };
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  ScanTab: undefined;
  Profile: undefined;
};
