export type ServiceType = 'airtime' | 'data' | 'electricity' | 'tv' | 'education';
export type TransactionStatus = 'successful' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  service: string;
  description: string;
  recipient: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  date: string;
  time: string;
  icon: string;
  color: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  number: string;
  network: string;
  color: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange';
  read: boolean;
}