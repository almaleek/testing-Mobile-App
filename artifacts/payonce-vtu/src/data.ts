import { Beneficiary, NotificationItem, ServiceType, Transaction } from './types';

export const serviceMeta: Record<ServiceType, { label: string; icon: string; color: string; description: string }> = {
  airtime: { label: 'Airtime', icon: 'phone-call', color: '#F4A340', description: 'Top up any Nigerian network instantly.' },
  data: { label: 'Data', icon: 'wifi', color: '#2E7CF6', description: 'Stay connected with flexible data plans.' },
  electricity: { label: 'Electricity', icon: 'zap', color: '#F2B84B', description: 'Pay your power bill without the queue.' },
  tv: { label: 'Cable TV', icon: 'tv', color: '#8B63D9', description: 'Keep your favourite shows playing.' },
  education: { label: 'Education', icon: 'book-open', color: '#24A88A', description: 'JAMB, WAEC and more, made simple.' },
};

export const networks = [
  { name: 'MTN', color: '#F4C430' },
  { name: 'Airtel', color: '#E7474B' },
  { name: 'Glo', color: '#2BAA64' },
  { name: '9mobile', color: '#7CB342' },
];

export const dataPlans: Record<string, { label: string; amount: number; hint: string }[]> = {
  MTN: [
    { label: '500MB', amount: 150, hint: '1 day' },
    { label: '1GB', amount: 350, hint: '7 days' },
    { label: '2GB', amount: 600, hint: '14 days' },
    { label: '5GB', amount: 1500, hint: '30 days' },
    { label: '10GB', amount: 3000, hint: '30 days' },
  ],
  Airtel: [
    { label: '1GB', amount: 350, hint: '7 days' },
    { label: '2GB', amount: 600, hint: '14 days' },
    { label: '5GB', amount: 1500, hint: '30 days' },
  ],
  Glo: [
    { label: '1.5GB', amount: 400, hint: '14 days' },
    { label: '3.5GB', amount: 800, hint: '30 days' },
    { label: '7.5GB', amount: 1500, hint: '30 days' },
  ],
  '9mobile': [
    { label: '1GB', amount: 300, hint: '7 days' },
    { label: '2.5GB', amount: 600, hint: '30 days' },
    { label: '11GB', amount: 2500, hint: '30 days' },
  ],
};

export const beneficiaries: Beneficiary[] = [
  { id: 'b1', name: 'Sodiq Abdulazeez', number: '0803 456 7890', network: 'MTN', color: '#F4C430' },
  { id: 'b2', name: 'Aisha Bello', number: '0816 227 1048', network: 'Airtel', color: '#E7474B' },
  { id: 'b3', name: 'Mum', number: '0805 778 2264', network: 'Glo', color: '#2BAA64' },
];

export const initialTransactions: Transaction[] = [
  { id: 'tx-1', service: 'MTN Data', description: '1GB data bundle', recipient: '0803 456 7890', amount: 500, fee: 0, status: 'successful', date: 'Today', time: '09:42 AM', icon: 'wifi', color: '#2E7CF6' },
  { id: 'tx-2', service: 'Airtel Airtime', description: 'Airtime top up', recipient: '0816 227 1048', amount: 1000, fee: 0, status: 'successful', date: 'Yesterday', time: '05:16 PM', icon: 'phone-call', color: '#E7474B' },
  { id: 'tx-3', service: 'AEDC Electricity', description: 'Prepaid meter token', recipient: '12345678901', amount: 5000, fee: 100, status: 'successful', date: 'Sep 18, 2026', time: '01:05 PM', icon: 'zap', color: '#F2B84B' },
  { id: 'tx-4', service: 'GOtv', description: 'GOtv Max subscription', recipient: '4612345678', amount: 7200, fee: 100, status: 'pending', date: 'Sep 17, 2026', time: '11:28 AM', icon: 'tv', color: '#8B63D9' },
  { id: 'tx-5', service: 'Airtel Airtime', description: 'Airtime top up', recipient: '0816 227 1048', amount: 1000, fee: 0, status: 'failed', date: 'Sep 16, 2026', time: '08:04 AM', icon: 'phone-call', color: '#E7474B' },
];

export const initialNotifications: NotificationItem[] = [
  { id: 'n1', title: 'Data purchase successful', body: 'Your MTN 1GB data purchase was successful.', time: '12 min ago', icon: 'check-circle', tone: 'green', read: false },
  { id: 'n2', title: 'Wallet funded', body: 'Your wallet has been funded with ₦10,000.', time: 'Yesterday', icon: 'credit-card', tone: 'blue', read: false },
  { id: 'n3', title: 'GOtv subscription due soon', body: 'Your GOtv subscription expires in 3 days.', time: 'Sep 17', icon: 'tv', tone: 'orange', read: true },
  { id: 'n4', title: 'New promotion available', body: 'Get 5% back on your next data purchase.', time: 'Sep 15', icon: 'gift', tone: 'blue', read: true },
];

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const serviceFromType = (type: string): ServiceType =>
  (['airtime', 'data', 'electricity', 'tv', 'education'].includes(type) ? type : 'airtime') as ServiceType;