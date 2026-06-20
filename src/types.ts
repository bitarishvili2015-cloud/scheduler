export interface HistoryEntry {
  id: string;
  timestamp: string;
  status: 'წარმატება' | 'შეცდომა' | 'მუშაობს...';
  records: number;
  duration: string;
  message: string;
}

export interface Job {
  id: string;
  name: string;
  source: 'SQL Server' | 'MySQL';
  server: string;
  database: string;
  user: string;
  query: string;
  excelFolder: string;
  frequency: 'daily' | 'weekdays' | 'everyN';
  weekdays: string[]; // e.g. ["ორშ", "ოთხ", "პარ"]
  everyNDays: number;
  runTimes: string[]; // e.g. ["08:00", "14:00"]
  deliveryMethod: 'Power Automate' | 'SMTP';
  recipients: string[];
  lastRun: string; // e.g. "დღეს 08:00" or ""
  lastStatus: 'წარმატება' | 'შეცდომა' | 'მუშაობს...' | 'ველოდებით';
  history: HistoryEntry[];
}

export interface Settings {
  startWithWindows: boolean;
  defaultExcelFolder: string;
  defaultSmtp: {
    server: string;
    port: string;
    sender: string;
  };
  theme: 'light' | 'dark';
}
