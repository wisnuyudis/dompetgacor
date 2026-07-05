import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, type Wallet, type Profile, type Transaction } from '../lib/api';
import { useAuth } from './AuthContext';

type WalletValue = {
  wallet: Wallet | null;
  profile: Profile | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  topup: (amount: number, note?: string) => Promise<Transaction>;
  transfer: (recipient: string, amount: number, note?: string) => Promise<Transaction>;
  payQr: (payee: string, amount: number, note?: string) => Promise<Transaction>;
};

const WalletContext = createContext<WalletValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [w, tx] = await Promise.all([api.getWallet(), api.getTransactions(20)]);
      setWallet(w.wallet);
      setProfile(w.profile);
      setTransactions(tx.transactions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) refresh();
    else {
      setWallet(null);
      setProfile(null);
      setTransactions([]);
    }
  }, [session, refresh]);

  const topup = async (amount: number, note?: string) => {
    const { transaction } = await api.topup(amount, note);
    await refresh();
    return transaction;
  };
  const transfer = async (recipient: string, amount: number, note?: string) => {
    const { transaction } = await api.transfer(recipient, amount, note);
    await refresh();
    return transaction;
  };
  const payQr = async (payee: string, amount: number, note?: string) => {
    const { transaction } = await api.payQr(payee, amount, note);
    await refresh();
    return transaction;
  };

  return (
    <WalletContext.Provider
      value={{ wallet, profile, transactions, loading, error, refresh, topup, transfer, payQr }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
