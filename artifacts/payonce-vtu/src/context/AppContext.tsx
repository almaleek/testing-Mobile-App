import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialNotifications, initialTransactions } from '../data';
import { NotificationItem, Transaction } from '../types';

interface AppContextValue {
  balance: number;
  transactions: Transaction[];
  notifications: NotificationItem[];
  hasSeenIntro: boolean;
  setHasSeenIntro: (value: boolean) => void;
  toggleBalance: () => void;
  balanceVisible: boolean;
  addTransaction: (transaction: Transaction) => void;
  fundWallet: (amount: number) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(25450);
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [hasSeenIntro, setHasSeenIntroState] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('payonce-intro').then((value) => setHasSeenIntroState(value === 'true'));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('payonce-balance', String(balance));
    AsyncStorage.setItem('payonce-transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const setHasSeenIntro = (value: boolean) => {
    setHasSeenIntroState(value);
    AsyncStorage.setItem('payonce-intro', String(value));
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((current) => [transaction, ...current]);
    if (transaction.status === 'successful') setBalance((current) => Math.max(0, current - transaction.amount - transaction.fee));
  };

  const fundWallet = (amount: number) => {
    setBalance((current) => current + amount);
    const id = `fund-${Date.now()}`;
    setTransactions((current) => [{
      id, service: 'Wallet funding', description: 'Card payment', recipient: 'PayOnce wallet',
      amount, fee: 0, status: 'successful', date: 'Today', time: 'Just now', icon: 'credit-card', color: '#1456D9',
    }, ...current]);
  };

  const value = useMemo(() => ({
    balance, transactions, notifications, hasSeenIntro, setHasSeenIntro,
    toggleBalance: () => setBalanceVisible((visible) => !visible),
    balanceVisible, addTransaction, fundWallet, markNotificationRead: (id: string) =>
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item)),
    unreadCount: notifications.filter((item) => !item.read).length,
  }), [balance, transactions, notifications, hasSeenIntro, balanceVisible]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}