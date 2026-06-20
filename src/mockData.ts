import { Job, Settings, HistoryEntry } from './types';

export const INITIAL_SETTINGS: Settings = {
  startWithWindows: true,
  defaultExcelFolder: 'C:\\Reports\\DefaultExports',
  defaultSmtp: {
    server: 'smtp.company.ge',
    port: '587',
    sender: 'reports@company.ge',
  },
  theme: 'light',
};

const createHistory = (jobName: string, isSuccess: boolean, daysAgo: number, timeStr: string): HistoryEntry => {
  const dateStr = `2026-06-${19 - daysAgo} ${timeStr}`;
  return {
    id: `hist-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: dateStr,
    status: isSuccess ? 'წარმატება' : 'შეცდომა',
    records: isSuccess ? Math.floor(Math.random() * 2000) + 120 : 0,
    duration: isSuccess ? `${(Math.random() * 5 + 1).toFixed(1)}წმ` : '0წმ',
    message: isSuccess 
      ? `ექსპორტი დასრულდა. Excel ფაილი წარმატებით შეიქმნა და გაიგზავნა.` 
      : `შეცდომა: კავშირი სერვერთან ვერ დამყარდა (Timeout expired).`,
  };
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    name: 'ყოველდღიური გაყიდვების რეპორტი',
    source: 'SQL Server',
    server: '192.168.1.100',
    database: 'SalesDB',
    user: 'reporter_user',
    query: `SELECT \n  o.order_id,\n  o.amount,\n  c.first_name,\n  c.last_name,\n  o.created_at\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.created_at >= DATEADD(day, -1, GETDATE())\nORDER BY o.created_at DESC;`,
    excelFolder: 'C:\\Reports\\Sales',
    frequency: 'daily',
    weekdays: [],
    everyNDays: 1,
    runTimes: ['09:00', '18:00'],
    deliveryMethod: 'SMTP',
    recipients: ['manager@company.ge', 'accounting@company.ge'],
    lastRun: 'დღეს 09:00',
    lastStatus: 'წარმატება',
    history: [
      {
        id: 'h1-1',
        timestamp: '2026-06-19 09:00',
        status: 'წარმატება',
        records: 842,
        duration: '2.4წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h1-2',
        timestamp: '2026-06-18 18:00',
        status: 'წარმატება',
        records: 1204,
        duration: '3.1წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h1-3',
        timestamp: '2026-06-18 09:00',
        status: 'წარმატება',
        records: 759,
        duration: '2.1წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h1-4',
        timestamp: '2026-06-17 18:00',
        status: 'წარმატება',
        records: 1102,
        duration: '2.9წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h1-5',
        timestamp: '2026-06-17 09:00',
        status: 'წარმატება',
        records: 620,
        duration: '1.8წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      }
    ]
  },
  {
    id: 'job-2',
    name: 'მომხმარებელთა აქტივობის ლოგი',
    source: 'MySQL',
    server: 'mysql-prod-01.company.local',
    database: 'analytics_db',
    user: 'analyst_grp',
    query: `SELECT \n  user_id,\n  action_type,\n  ip_address,\n  COUNT(*) as action_count \nFROM user_actions \nWHERE created_at >= NOW() - INTERVAL 1 DAY \nGROUP BY user_id, action_type, ip_address;`,
    excelFolder: 'C:\\Reports\\Analytics',
    frequency: 'weekdays',
    weekdays: ['ორშ', 'ოთხ', 'პარ'],
    everyNDays: 1,
    runTimes: ['08:00', '14:00'],
    deliveryMethod: 'Power Automate',
    recipients: ['admin@company.ge'],
    lastRun: 'დღეს 08:00',
    lastStatus: 'წარმატება',
    history: [
      {
        id: 'h2-1',
        timestamp: '2026-06-19 08:00',
        status: 'წარმატება',
        records: 4390,
        duration: '4.8წმ',
        message: 'ექსპორტი წარმატებით დასრულდა. ფაილი აიტვირთა და ტრიგერი გადაეცა Power Automate-ს.',
      },
      {
        id: 'h2-2',
        timestamp: '2026-06-17 14:00',
        status: 'წარმატება',
        records: 3981,
        duration: '4.2წმ',
        message: 'ექსპორტი წარმატებით დასრულდა. ფაილი აიტვირთა და ტრიგერი გადაეცა Power Automate-ს.',
      },
      {
        id: 'h2-3',
        timestamp: '2026-06-17 08:00',
        status: 'წარმატება',
        records: 4120,
        duration: '4.5წმ',
        message: 'ექსპორტი წარმატებით დასრულდა. ფაილი აიტვირთა და ტრიგერი გადაეცა Power Automate-ს.',
      },
      {
        id: 'h2-4',
        timestamp: '2026-06-15 14:00',
        status: 'წარმატება',
        records: 3876,
        duration: '4.0წმ',
        message: 'ექსპორტი წარმატებით დასრულდა. ფაილი აიტვირთა და ტრიგერი გადაეცა Power Automate-ს.',
      },
      {
        id: 'h2-5',
        timestamp: '2026-06-15 08:00',
        status: 'წარმატება',
        records: 4501,
        duration: '5.2წმ',
        message: 'ექსპორტი წარმატებით დასრულდა. ფაილი აიტვირთა და ტრიგერი გადაეცა Power Automate-ს.',
      }
    ]
  },
  {
    id: 'job-3',
    name: 'ჯარიმების შეჯამება (SQL)',
    source: 'SQL Server',
    server: '10.0.4.45',
    database: 'BillingDB',
    user: 'billing_sa',
    query: `SELECT \n  fines.id, \n  fines.amount, \n  fines.issue_date, \n  users.full_name \nFROM fines \nJOIN users ON fines.user_id = users.id \nWHERE fines.status = 'pending' \nORDER BY issue_date DESC;`,
    excelFolder: 'C:\\Reports\\GasMeters',
    frequency: 'everyN',
    weekdays: [],
    everyNDays: 3,
    runTimes: ['08:00'],
    deliveryMethod: 'SMTP',
    recipients: ['audit@company.ge', 'compliance@company.ge'],
    lastRun: 'დღეს 08:00',
    lastStatus: 'შეცდომა',
    history: [
      {
        id: 'h3-1',
        timestamp: '2026-06-19 08:00',
        status: 'შეცდომა',
        records: 0,
        duration: '15.2წმ',
        message: 'კავშირის შეცდომა: სერვერთან კავშირი `10.0.4.45` ვერ დამყარდა (Timeout expired). გთხოვთ შეამოწმოთ სერვერის პარამეტრები ან ქსელური წვდომა.',
      },
      {
        id: 'h3-2',
        timestamp: '2026-06-16 08:00',
        status: 'წარმატება',
        records: 45,
        duration: '1.2წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h3-3',
        timestamp: '2026-06-13 08:00',
        status: 'წარმატება',
        records: 39,
        duration: '1.1წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h3-4',
        timestamp: '2026-06-10 08:00',
        status: 'წარმატება',
        records: 52,
        duration: '1.4წმ',
        message: 'ექსპორტი წარმატებით დასრულდა და გაიგზავნა SMTP-ის საშუალებით.',
      },
      {
        id: 'h3-5',
        timestamp: '2026-06-07 08:00',
        status: 'შეცდომა',
        records: 0,
        duration: '15.1წმ',
        message: 'კავშირის შეცდომა: მომხმარებლის ავტორიზაცია ვერ მოხერხდა `billing_sa` მომხმარებლისთვის.',
      }
    ]
  }
];
