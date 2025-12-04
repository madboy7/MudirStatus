export enum OfficeStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  CLOSED = 'CLOSED',
  PRAYER = 'PRAYER',
}

export interface StatusData {
  status: OfficeStatus;
  message: string;
  timestamp: number;
  customContext?: string;
}

export const STORAGE_KEY = 'mudir_status_data';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}