/* LocalStorage Database Adapter & Schema Manager */

const DB = (() => {
  const KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    TRANSACTIONS: 'transactions',
    NOTIFICATIONS: 'notifications',
    THEME: 'theme',
    SETTINGS: 'settings',
    EMAILS: 'emails'
  };

  // Helper methods
  const get = (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  };

  const set = (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  };

  // Initialize DB and Seed Demo Data
  const SEED_VERSION = 'v12'; // bump this whenever seed data changes
  const init = () => {
    // Wipe stale data if seed version has changed
    if (get('seedVersion') !== SEED_VERSION) {
      localStorage.clear();
      set('seedVersion', SEED_VERSION);
    }

    // 1. Initialise users if empty
    if (!get(KEYS.USERS)) {
      const demoUsers = [
        {
          id: "USR001",
          customerId: "CUS839472",
          accountNumber: "1083759275",
          fullName: "Jane Smith",
          username: "janesmith",
          email: "jane@gmail.com",
          phone: "+61 403 123 456",
          password: "Password123!",
          balance: 170000,
          profileImage: "avatar1",
          address: "12 George Street, Sydney NSW 2000",
          createdAt: new Date("2026-06-01T10:00:00Z").toISOString()
        },
        {
          id: "USR002",
          customerId: "CUS194827",
          accountNumber: "1098472859",
          fullName: "Mike Johnson",
          username: "mikejohnson",
          email: "mike@gmail.com",
          phone: "+61 412 987 654",
          password: "Password123!",
          balance: 80000,
          profileImage: "avatar2",
          address: "45 Collins Street, Melbourne VIC 3000",
          createdAt: new Date("2026-06-15T14:30:00Z").toISOString()
        },
        {
          id: "USR003",
          customerId: "CUS572048",
          accountNumber: "1073648291",
          fullName: "John & Aileen Karpathakis",
          username: "jakarpathakis",
          email: "jakarpathakis223@gmail.com",
          phone: "+447512813601",
          password: "Angel562!",
          balance: 218911815,
          profileImage: "avatar3",
          address: "88 Pitt Street, Brisbane QLD 4000",
          createdAt: new Date("2025-04-01T09:00:00Z").toISOString()
        },
        {
          id: "USR004",
          customerId: "CUS194905",
          accountNumber: "1099919491",
          fullName: "James Dale Williams",
          username: "Nata 9991**9491",
          email: "jamesdw8642@zicloud.com",
          phone: "+1 (555) 123-4567",
          password: "*777Macrena$%",
          balance: 666670000,
          profileImage: "avatar1",
          address: "5369 Blue Ridge Way, Fontana, CA, 92336",
          dob: "May 31, 1949",
          createdAt: new Date("2015-01-15T09:00:00Z").toISOString()
        }
      ];
      set(KEYS.USERS, demoUsers);

      // 2. Initialize Seed Transactions
      const demoTransactions = [
        {
          id: "TXN100000001",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Compressive Savings Bank of Texas Reserve",
          receiverAccountNumber: "1083759275",
          receiverName: "Jane Smith",
          amount: 150000,
          description: "Initial Balance Seed",
          date: new Date("2026-06-01T10:00:00Z").toISOString()
        },
        {
          id: "TXN100000002",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Compressive Savings Bank of Texas Reserve",
          receiverAccountNumber: "1098472859",
          receiverName: "Mike Johnson",
          amount: 100000,
          description: "Initial Balance Seed",
          date: new Date("2026-06-15T14:30:00Z").toISOString()
        },
        {
          id: "TXN100000003",
          type: "transfer",
          senderAccountNumber: "1098472859",
          senderName: "Mike Johnson",
          receiverAccountNumber: "1083759275",
          receiverName: "Jane Smith",
          amount: 20000,
          description: "Split dinner bill",
          date: new Date("2026-07-01T20:15:00Z").toISOString()
        },
        {
          id: "TXN100000004",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "NDLOVU SECURITY COMPANY",
          receiverAccountNumber: "1073648291",
          receiverName: "John & Aileen Karpathakis",
          amount: 178900000,
          description: "Security Services Contract Payment",
          date: new Date("2026-06-15T12:00:00Z").toISOString()
        },
        {
          id: "TXN100000005",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Compressive Savings Bank of Texas Reserve",
          receiverAccountNumber: "1073648291",
          receiverName: "John & Aileen Karpathakis",
          amount: 11815,
          description: " Balance Seed",
          date: new Date("2026-05-01T09:00:00Z").toISOString()
        },
        {
          id: "TXN100000006",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Compressive Savings Bank of Texas Reserve",
          receiverAccountNumber: "1099919491",
          receiverName: "James Dale Williams",
          amount: 10000000,
          description: "Initial Capital Deposit",
          date: new Date("2015-01-15T09:15:00Z").toISOString()
        },
        {
          id: "TXN100000007",
          type: "withdraw",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "SYSTEM",
          receiverName: "Cash Withdrawal",
          amount: 50000,
          description: "Property Investment Setup",
          date: new Date("2016-04-12T11:00:00Z").toISOString()
        },
        {
          id: "TXN100000008",
          type: "transfer",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "1083759275",
          receiverName: "Jane Smith",
          amount: 120000,
          description: "Consulting Fees",
          date: new Date("2017-08-22T14:20:00Z").toISOString()
        },
        {
          id: "TXN100000009",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Business Equity Inc",
          receiverAccountNumber: "1099919491",
          receiverName: "James Dale Williams",
          amount: 45000000,
          description: "Equity Buyout Proceeds",
          date: new Date("2018-11-05T10:30:00Z").toISOString()
        },
        {
          id: "TXN100000010",
          type: "withdraw",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "SYSTEM",
          receiverName: "Cash Withdrawal",
          amount: 250000,
          description: "Luxury Vehicle Acquisition",
          date: new Date("2019-03-19T16:45:00Z").toISOString()
        },
        {
          id: "TXN100000011",
          type: "transfer",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "1098472859",
          receiverName: "Mike Johnson",
          amount: 5000,
          description: "Family Gift Transfer",
          date: new Date("2020-07-14T09:00:00Z").toISOString()
        },
        {
          id: "TXN100000012",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Global Wealth Mutual",
          receiverAccountNumber: "1099919491",
          receiverName: "James Dale Williams",
          amount: 150000000,
          description: "Capital Gains payout",
          date: new Date("2021-09-30T13:00:00Z").toISOString()
        },
        {
          id: "TXN100000013",
          type: "transfer",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "1073648291",
          receiverName: "John & Aileen Karpathakis",
          amount: 50000,
          description: "Private Holiday Booking Share",
          date: new Date("2022-12-25T12:00:00Z").toISOString()
        },
        {
          id: "TXN100000014",
          type: "withdraw",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "SYSTEM",
          receiverName: "ATM Withdrawal",
          amount: 1000000,
          description: "Asset Procurement",
          date: new Date("2023-05-18T10:15:00Z").toISOString()
        },
        {
          id: "TXN100000015",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "Inheritance Trust",
          receiverAccountNumber: "1099919491",
          receiverName: "James Dale Williams",
          amount: 300000000,
          description: "Trust Fund Inheritance Release",
          date: new Date("2024-02-10T11:00:00Z").toISOString()
        },
        {
          id: "TXN100000016",
          type: "transfer",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "1073648291",
          receiverName: "John & Aileen Karpathakis",
          amount: 1500000,
          description: "Investment Partnership Contribution",
          date: new Date("2025-06-30T14:00:00Z").toISOString()
        },
        {
          id: "TXN100000017",
          type: "withdraw",
          senderAccountNumber: "1099919491",
          senderName: "James Dale Williams",
          receiverAccountNumber: "SYSTEM",
          receiverName: "Cash Out",
          amount: 500000,
          description: "Offshore Vault Relocation",
          date: new Date("2026-01-10T15:30:00Z").toISOString()
        },
        {
          id: "TXN100000018",
          type: "deposit",
          senderAccountNumber: "SYSTEM",
          senderName: "US Treasury",
          receiverAccountNumber: "1099919491",
          receiverName: "James Dale Williams",
          amount: 164155000,
          description: "Treasury Bonds Maturation Payment",
          date: new Date("2026-07-20T10:00:00Z").toISOString()
        }
      ];
      set(KEYS.TRANSACTIONS, demoTransactions);

      // 3. Initialize Seed Notifications
      const demoNotifications = [
        {
          id: "NTF100001",
          userId: "USR001",
          type: "info",
          title: "Welcome to Compressive Savings Bank of Texas",
          description: "Your digital bank account has been initialized successfully.",
          read: true,
          date: new Date("2026-06-01T10:05:00Z").toISOString()
        },
        {
          id: "NTF100002",
          userId: "USR002",
          type: "info",
          title: "Welcome to Compressive Savings Bank of Texas",
          description: "Your digital bank account has been initialized successfully.",
          read: true,
          date: new Date("2026-06-15T14:35:00Z").toISOString()
        },
        {
          id: "NTF100003",
          userId: "USR001",
          type: "success",
          title: "Credit Alert ($20,000.00)",
          description: "You have received $20,000.00 from Mike Johnson.",
          read: false,
          date: new Date("2026-07-01T20:15:00Z").toISOString()
        },
        {
          id: "NTF100004",
          userId: "USR002",
          type: "danger",
          title: "Debit Alert ($20,000.00)",
          description: "You have successfully sent $20,000.00 to Jane Smith.",
          read: true,
          date: new Date("2026-07-01T20:15:00Z").toISOString()
        },
        {
          id: "NTF100005",
          userId: "USR003",
          type: "info",
          title: "Welcome to Compressive Savings Bank of Texas",
          description: "Your digital bank account has been initialized successfully.",
          read: false,
          date: new Date("2026-07-01T09:05:00Z").toISOString()
        },
        {
          id: "NTF100006",
          userId: "USR003",
          type: "success",
          title: "Credit Alert ($178,900,000.00)",
          description: "Your account was credited with $178,900,000.00 from NDLOVU SECURITY COMPANY.",
          read: false,
          date: new Date("2026-06-15T12:05:00Z").toISOString()
        },
        {
          id: "NTF100007",
          userId: "USR003",
          type: "success",
          title: "Credit Alert ($11,815.00)",
          description: "Your account was credited with $11,815.00 — Initial Balance Seed.",
          read: false,
          date: new Date("2026-07-01T09:05:00Z").toISOString()
        },
        {
          id: "NTF100008",
          userId: "USR004",
          type: "success",
          title: "Welcome to Compressive Savings Bank of Texas",
          description: "Your digital bank account has been initialized successfully.",
          read: false,
          date: new Date("2026-07-21T13:00:00Z").toISOString()
        },
        {
          id: "NTF100009",
          userId: "USR004",
          type: "success",
          title: "Credit Alert ($500,000,000.00)",
          description: "Your account was credited with $500,000,000.00 — Initial Balance Deposit.",
          read: false,
          date: new Date("2026-07-21T13:00:00Z").toISOString()
        }
      ];
      set(KEYS.NOTIFICATIONS, demoNotifications);

      // 4. Initialize Seed Emails
      const demoEmails = [
        {
          id: "EML100001",
          to: "jane@gmail.com",
          subject: "Welcome to Compressive Savings Bank of Texas",
          body: "Hello Jane Smith,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS839472\nAccount Number: 1083759275\nAddress: 12 George Street, Sydney NSW 2000\n\nThank you for choosing Compressive Savings Bank of Texas.",
          date: new Date("2026-06-01T10:00:00Z").toISOString(),
          status: "Delivered (Mock)"
        },
        {
          id: "EML100002",
          to: "mike@gmail.com",
          subject: "Welcome to Compressive Savings Bank of Texas",
          body: "Hello Mike Johnson,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS194827\nAccount Number: 1098472859\nAddress: 45 Collins Street, Melbourne VIC 3000\n\nThank you for choosing Compressive Savings Bank of Texas.",
          date: new Date("2026-06-15T14:30:00Z").toISOString(),
          status: "Delivered (Mock)"
        },
        {
          id: "EML100003",
          to: "jane@gmail.com",
          subject: "Credit Alert: $20,000.00 Received",
          body: "Dear Jane Smith,\n\nYour account has been credited with $20,000.00 from Mike Johnson.\n\nReference: TXN100000003\nNew Balance: $170,000.00\n\nCompressive Savings Bank of Texas.",
          date: new Date("2026-07-01T20:15:00Z").toISOString(),
          status: "Delivered (Mock)"
        },
        {
          id: "EML100004",
          to: "jakarpathakis223@gmail.com",
          subject: "Welcome to Compressive Savings Bank of Texas",
          body: "Hello John & Aileen Karpathakis,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS572048\nAccount Number: 1073648291\nPhone: +447512813601\nAddress: 88 Pitt Street, Brisbane QLD 4000\n\nThank you for choosing Compressive Savings Bank of Texas.",
          date: new Date("2026-07-01T09:00:00Z").toISOString(),
          status: "Delivered (Mock)"
        },
        {
          id: "EML100005",
          to: "jakarpathakis223@gmail.com",
          subject: "Credit Notification: $178,900,000.00 Received",
          body: "Dear John & Aileen Karpathakis,\n\nYour account has been credited with $178,900,000.00 from NDLOVU SECURITY COMPANY.\n\nTransaction Reference: TXN100000004\nNew Balance: $178,900,000.00\n\nCompressive Savings Bank of Texas.",
          date: new Date("2026-06-15T12:00:00Z").toISOString(),
          status: "Delivered (Mock)"
        },
        {
          id: "EML100006",
          to: "compressivesavings@zohomail.com",
          subject: "Welcome to Compressive Savings Bank of Texas",
          body: "Hello James Dale Williams,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS194905\nAccount Number: 1099919491\nAddress: 5369 Blue Ridge Way, Fontana, CA, 92336\n\nThank you for choosing Compressive Savings Bank of Texas.",
          date: new Date("2026-07-21T13:00:00Z").toISOString(),
          status: "Delivered (Mock)"
        }
      ];
      set(KEYS.EMAILS, demoEmails);
    }

    // Default settings
    if (!get(KEYS.SETTINGS)) {
      set(KEYS.SETTINGS, {
        sessionTimeoutMinutes: 15,
        showBalance: true,
        emailAlerts: false,
        emailDeliveryMode: 'live', // 'mock' or 'live'
        emailjsPublicKey: '9zVEGau5i1yKnXZND',
        emailjsServiceId: 'service_trlvuws',
        emailjsTemplateId: 'Sage1909'
      });
    }

    // Default theme
    if (!get(KEYS.THEME)) {
      set(KEYS.THEME, 'system');
    }
  };

  // Run initial setup immediately
  init();

  return {
    KEYS,
    getUsers: () => get(KEYS.USERS) || [],
    saveUsers: (users) => set(KEYS.USERS, users),

    getCurrentUser: () => get(KEYS.CURRENT_USER),
    setCurrentUser: (user) => set(KEYS.CURRENT_USER, user),
    clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

    getTransactions: () => get(KEYS.TRANSACTIONS) || [],
    saveTransactions: (txs) => set(KEYS.TRANSACTIONS, txs),

    getNotifications: () => get(KEYS.NOTIFICATIONS) || [],
    saveNotifications: (notes) => set(KEYS.NOTIFICATIONS, notes),

    getTheme: () => get(KEYS.THEME, 'system'),
    saveTheme: (theme) => set(KEYS.THEME, theme),

    getSettings: () => get(KEYS.SETTINGS) || {},
    saveSettings: (settings) => set(KEYS.SETTINGS, settings),

    getEmails: () => get(KEYS.EMAILS) || [],
    saveEmails: (emails) => set(KEYS.EMAILS, emails)
  };
})();
