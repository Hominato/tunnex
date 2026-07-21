-- 1. Create CUSTOM TYPES / ENUMS if needed
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'danger');

-- 2. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password TEXT NOT NULL, -- Stored hashed or plain depending on mock setup
    balance NUMERIC(15, 2) DEFAULT 0.00,
    profile_image VARCHAR(100) DEFAULT 'avatar1',
    address TEXT,
    dob VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type transaction_type NOT NULL,
    sender_account_number VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    receiver_account_number VARCHAR(50) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE EMAILS TABLE (Outbox / Sent logs)
CREATE TABLE IF NOT EXISTS emails (
    id VARCHAR(50) PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Delivered'
);

-- 6. CREATE SETTINGS TABLE (Can store user or global settings)
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    session_timeout_minutes INT DEFAULT 15,
    show_balance BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT FALSE,
    email_delivery_mode VARCHAR(20) DEFAULT 'live',
    emailjs_public_key VARCHAR(100),
    emailjs_service_id VARCHAR(100),
    emailjs_template_id VARCHAR(100)
);


-- ==========================================
-- SEED DATA (Matching your js/storage.js data)
-- ==========================================

-- Seed Users
INSERT INTO users (id, customer_id, account_number, full_name, username, email, phone, password, balance, profile_image, address, dob, created_at)
VALUES
('USR001', 'CUS839472', '1083759275', 'Jane Smith', 'janesmith', 'jane@gmail.com', '+61 403 123 456', 'Password123!', 170000.00, 'avatar1', '12 George Street, Sydney NSW 2000', NULL, '2026-06-01 10:00:00+00'),
('USR002', 'CUS194827', '1098472859', 'Mike Johnson', 'mikejohnson', 'mike@gmail.com', '+61 412 987 654', 'Password123!', 80000.00, 'avatar2', '45 Collins Street, Melbourne VIC 3000', NULL, '2026-06-15 14:30:00+00'),
('USR003', 'CUS572048', '1073648291', 'John & Aileen Karpathakis', 'jakarpathakis', 'jakarpathakis223@gmail.com', '+447512813601', 'Angel562!', 218911815.00, 'avatar3', '88 Pitt Street, Brisbane QLD 4000', NULL, '2025-04-01 09:00:00+00'),
('USR004', 'CUS194905', '1099919491', 'James Dale Williams', 'Nata 9991**9491', 'jamesdw8642@zicloud.com', '+1 (555) 123-4567', '*777Macrena$%', 666670000.00, 'avatar1', '5369 Blue Ridge Way, Fontana, CA, 92336', 'May 31, 1949', '2015-01-15 09:00:00+00')
ON CONFLICT DO NOTHING;

-- Seed Transactions
INSERT INTO transactions (id, type, sender_account_number, sender_name, receiver_account_number, receiver_name, amount, description, date)
VALUES
('TXN100000001', 'deposit', 'SYSTEM', 'Compressive Savings Bank of Texas Reserve', '1083759275', 'Jane Smith', 150000.00, 'Initial Balance Seed', '2026-06-01 10:00:00+00'),
('TXN100000002', 'deposit', 'SYSTEM', 'Compressive Savings Bank of Texas Reserve', '1098472859', 'Mike Johnson', 100000.00, 'Initial Balance Seed', '2026-06-15 14:30:00+00'),
('TXN100000003', 'transfer', '1098472859', 'Mike Johnson', '1083759275', 'Jane Smith', 20000.00, 'Split dinner bill', '2026-07-01 20:15:00+00'),
('TXN100000004', 'deposit', 'SYSTEM', 'NDLOVU SECURITY COMPANY', '1073648291', 'John & Aileen Karpathakis', 178900000.00, 'Security Services Contract Payment', '2026-06-15 12:00:00+00'),
('TXN100000005', 'deposit', 'SYSTEM', 'Compressive Savings Bank of Texas Reserve', '1073648291', 'John & Aileen Karpathakis', 11815.00, ' Balance Seed', '2026-05-01 09:00:00+00'),
('TXN100000006', 'deposit', 'SYSTEM', 'Compressive Savings Bank of Texas Reserve', '1099919491', 'James Dale Williams', 10000000.00, 'Initial Capital Deposit', '2015-01-15 09:15:00+00'),
('TXN100000007', 'withdrawal', '1099919491', 'James Dale Williams', 'SYSTEM', 'Cash Withdrawal', 50000.00, 'Property Investment Setup', '2016-04-12 11:00:00+00'),
('TXN100000008', 'transfer', '1099919491', 'James Dale Williams', '1083759275', 'Jane Smith', 120000.00, 'Consulting Fees', '2017-08-22 14:20:00+00'),
('TXN100000009', 'deposit', 'SYSTEM', 'Business Equity Inc', '1099919491', 'James Dale Williams', 45000000.00, 'Equity Buyout Proceeds', '2018-11-05 10:30:00+00'),
('TXN100000010', 'withdrawal', '1099919491', 'James Dale Williams', 'SYSTEM', 'Cash Withdrawal', 250000.00, 'Luxury Vehicle Acquisition', '2019-03-19 16:45:00+00'),
('TXN100000011', 'transfer', '1099919491', 'James Dale Williams', '1098472859', 'Mike Johnson', 5000.00, 'Family Gift Transfer', '2020-07-14 09:00:00+00'),
('TXN100000012', 'deposit', 'SYSTEM', 'Global Wealth Mutual', '1099919491', 'James Dale Williams', 150000000.00, 'Capital Gains payout', '2021-09-30 13:00:00+00'),
('TXN100000013', 'transfer', '1099919491', 'James Dale Williams', '1073648291', 'John & Aileen Karpathakis', 50000.00, 'Private Holiday Booking Share', '2022-12-25 12:00:00+00'),
('TXN100000014', 'withdrawal', '1099919491', 'James Dale Williams', 'SYSTEM', 'ATM Withdrawal', 1000000.00, 'Asset Procurement', '2023-05-18 10:15:00+00'),
('TXN100000015', 'deposit', 'SYSTEM', 'Inheritance Trust', '1099919491', 'James Dale Williams', 300000000.00, 'Trust Fund Inheritance Release', '2024-02-10 11:00:00+00'),
('TXN100000016', 'transfer', '1099919491', 'James Dale Williams', '1073648291', 'John & Aileen Karpathakis', 1500000.00, 'Investment Partnership Contribution', '2025-06-30 14:00:00+00'),
('TXN100000017', 'withdrawal', '1099919491', 'James Dale Williams', 'SYSTEM', 'Cash Out', 500000.00, 'Offshore Vault Relocation', '2026-01-10 15:30:00+00'),
('TXN100000018', 'deposit', 'SYSTEM', 'US Treasury', '1099919491', 'James Dale Williams', 164155000.00, 'Treasury Bonds Maturation Payment', '2026-07-20 10:00:00+00')
ON CONFLICT DO NOTHING;

-- Seed Notifications
INSERT INTO notifications (id, user_id, type, title, description, read, date)
VALUES
('NTF100001', 'USR001', 'info', 'Welcome to Compressive Savings Bank of Texas', 'Your digital bank account has been initialized successfully.', TRUE, '2026-06-01 10:05:00+00'),
('NTF100002', 'USR002', 'info', 'Welcome to Compressive Savings Bank of Texas', 'Your digital bank account has been initialized successfully.', TRUE, '2026-06-15 14:35:00+00'),
('NTF100003', 'USR001', 'success', 'Credit Alert ($20,000.00)', 'You have received $20,000.00 from Mike Johnson.', FALSE, '2026-07-01 20:15:00+00'),
('NTF100004', 'USR002', 'danger', 'Debit Alert ($20,000.00)', 'You have successfully sent $20,000.00 to Jane Smith.', TRUE, '2026-07-01 20:15:00+00'),
('NTF100005', 'USR003', 'info', 'Welcome to Compressive Savings Bank of Texas', 'Your digital bank account has been initialized successfully.', FALSE, '2026-07-01 09:05:00+00'),
('NTF100006', 'USR003', 'success', 'Credit Alert ($178,900,000.00)', 'Your account was credited with $178,900,000.00 from NDLOVU SECURITY COMPANY.', FALSE, '2026-06-15 12:05:00+00'),
('NTF100007', 'USR003', 'success', 'Credit Alert ($11,815.00)', 'Your account was credited with $11,815.00 — Initial Balance Seed.', FALSE, '2026-07-01 09:05:00+00'),
('NTF100008', 'USR004', 'success', 'Welcome to Compressive Savings Bank of Texas', 'Your digital bank account has been initialized successfully.', FALSE, '2026-07-21 13:00:00+00'),
('NTF100009', 'USR004', 'success', 'Credit Alert ($500,000,000.00)', 'Your account was credited with $500,000,000.00 — Initial Balance Deposit.', FALSE, '2026-07-21 13:00:00+00')
ON CONFLICT DO NOTHING;

-- Seed Emails
INSERT INTO emails (id, to_email, subject, body, date, status)
VALUES
('EML100001', 'jane@gmail.com', 'Welcome to Compressive Savings Bank of Texas', 'Hello Jane Smith,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS839472\nAccount Number: 1083759275\nAddress: 12 George Street, Sydney NSW 2000\n\nThank you for choosing Compressive Savings Bank of Texas.', '2026-06-01 10:00:00+00', 'Delivered (Mock)'),
('EML100002', 'mike@gmail.com', 'Welcome to Compressive Savings Bank of Texas', 'Hello Mike Johnson,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS194827\nAccount Number: 1098472859\nAddress: 45 Collins Street, Melbourne VIC 3000\n\nThank you for choosing Compressive Savings Bank of Texas.', '2026-06-15 14:30:00+00', 'Delivered (Mock)'),
('EML100003', 'jane@gmail.com', 'Credit Alert: $20,000.00 Received', 'Dear Jane Smith,\n\nYour account has been credited with $20,000.00 from Mike Johnson.\n\nReference: TXN100000003\nNew Balance: $170,000.00\n\nCompressive Savings Bank of Texas.', '2026-07-01 20:15:00+00', 'Delivered (Mock)'),
('EML100004', 'jakarpathakis223@gmail.com', 'Welcome to Compressive Savings Bank of Texas', 'Hello John & Aileen Karpathakis,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS572048\nAccount Number: 1073648291\nPhone: +447512813601\nAddress: 88 Pitt Street, Brisbane QLD 4000\n\nThank you for choosing Compressive Savings Bank of Texas.', '2026-07-01 09:00:00+00', 'Delivered (Mock)'),
('EML100005', 'jakarpathakis223@gmail.com', 'Credit Notification: $178,900,000.00 Received', 'Dear John & Aileen Karpathakis,\n\nYour account has been credited with $178,900,000.00 from NDLOVU SECURITY COMPANY.\n\nTransaction Reference: TXN100000004\nNew Balance: $178,900,000.00\n\nCompressive Savings Bank of Texas.', '2026-06-15 12:00:00+00', 'Delivered (Mock)'),
('EML100006', 'compressivesavings@zohomail.com', 'Welcome to Compressive Savings Bank of Texas', 'Hello James Dale Williams,\n\nWe are excited to welcome you to Compressive Savings Bank of Texas!\n\nCustomer ID: CUS194905\nAccount Number: 1099919491\nAddress: 5369 Blue Ridge Way, Fontana, CA, 92336\n\nThank you for choosing Compressive Savings Bank of Texas.', '2026-07-21 13:00:00+00', 'Delivered (Mock)')
ON CONFLICT DO NOTHING;

-- Seed Default global settings
INSERT INTO settings (user_id, session_timeout_minutes, show_balance, email_alerts, email_delivery_mode, emailjs_public_key, emailjs_service_id, emailjs_template_id)
VALUES
('USR001', 15, TRUE, FALSE, 'live', '9zVEGau5i1yKnXZND', 'service_trlvuws', 'Sage1909'),
('USR002', 15, TRUE, FALSE, 'live', '9zVEGau5i1yKnXZND', 'service_trlvuws', 'Sage1909'),
('USR003', 15, TRUE, FALSE, 'live', '9zVEGau5i1yKnXZND', 'service_trlvuws', 'Sage1909'),
('USR004', 15, TRUE, FALSE, 'live', '9zVEGau5i1yKnXZND', 'service_trlvuws', 'Sage1909')
ON CONFLICT DO NOTHING;
