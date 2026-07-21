# ApexBank — Modern Digital Banking Frontend MVP

A fully interactive, **frontend-only** digital banking web application built with **HTML5, CSS3, and Vanilla JavaScript**. All data persists in `localStorage` — no backend required.

---

## 🚀 Quick Start

1. Open `/Users/goldensig/Desktop/cmbnk/index.html` directly in your browser.
2. Click **"Open Account"** or use the demo credentials below.
3. Explore the full banking dashboard.

### 📋 Demo Accounts

| Name | Email | Password | Account Number |
|---|---|---|---|
| Jane Smith | `jane@gmail.com` | `Password123!` | `1083759275` |
| Mike Johnson | `mike@gmail.com` | `Password123!` | `1098472859` |
| John & Aileen Karpathakis | `jakarpathakis223@gmail.com` | `Password123!` | `1073648291` |

> **Tip:** Log in as Jane, then transfer money to Mike's account to test the full transfer flow.

---

## 📁 Project Structure

```
banking-system/
├── index.html          # Landing Page
├── login.html          # Sign In
├── register.html       # Create Account
├── dashboard.html      # Main Dashboard
├── deposit.html        # Deposit Funds
├── withdraw.html       # Withdraw Cash
├── transfer.html       # P2P Transfer
├── history.html        # Transaction Ledger
├── notifications.html  # Alert Center
├── profile.html        # Profile Editor
├── settings.html       # Preferences
├── email-center.html   # Mock Email Inbox
│
├── css/
│   ├── global.css      # Design tokens, theme variables
│   ├── components.css  # Buttons, toasts, sidebar, cards
│   ├── forms.css       # Input styling, validation states
│   ├── auth.css        # Login/Register split layout
│   ├── dashboard.css   # Dashboard-specific styles
│   └── responsive.css  # Mobile & tablet breakpoints
│
└── js/
    ├── storage.js      # localStorage adapter + seed data
    ├── utils.js        # Formatters, toasts, animations
    ├── email.js        # SMTP simulator
    ├── app.js          # Bootstrap, guards, sidebar injection
    ├── auth.js         # Registration & login logic
    ├── dashboard.js    # Balance stats & transaction list
    ├── charts.js       # Chart.js visualizations
    ├── deposit.js      # Deposit transaction logic
    ├── withdraw.js     # Withdrawal + overdraft protection
    ├── transfer.js     # P2P transfer + dual notifications
    ├── history.js      # Search, filter, sort, CSV export
    ├── notifications.js # Notification center
    ├── profile.js      # Avatar picker & profile editor
    ├── settings.js     # Theme, password, backup/restore
    └── email-center.js # Mock email reader
```

---

## ✨ Features

| Feature | Status |
|---|---|
| User Registration (auto Account No + Customer ID) | ✅ |
| Login with session management | ✅ |
| 15-min inactivity timeout | ✅ |
| Dashboard with live balance + stats | ✅ |
| Deposit with preset amounts | ✅ |
| Withdrawal with overdraft protection | ✅ |
| Peer-to-peer transfer with confirmation modal | ✅ |
| Dual notifications (sender + receiver) | ✅ |
| Transaction history (search, filter, sort, paginate) | ✅ |
| CSV export + browser print/PDF | ✅ |
| Notification center with unread badges | ✅ |
| Profile editor with avatar picker + photo upload | ✅ |
| Dark / Light / System theme switching | ✅ |
| Password change | ✅ |
| JSON database backup & restore | ✅ |
| Mock email center (SMTP simulator) | ✅ |
| Chart.js financial charts (4 chart types) | ✅ |
| Glassmorphism UI + micro-animations | ✅ |
| Fully responsive (mobile, tablet, desktop) | ✅ |

---

## ⚠️ Sandbox Notice

This is a **frontend-only MVP**. No real banking operations are performed. Data is stored in your browser's `localStorage` only. Do not enter real banking credentials.

---

## 🎨 Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, glassmorphism, animations
- **Vanilla JS (ES6+)** — Modular architecture
- **Chart.js** — Financial visualizations
- **Font Awesome 6** — Icon library
- **Google Fonts** — Poppins typography
- **localStorage** — Browser-side database
