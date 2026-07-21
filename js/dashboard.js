/* Dashboard Data Binding & View Manager */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const initDashboard = () => {
    const updatedUser = DB.getCurrentUser();
    // Initialize display details
    document.getElementById('account-number-val').innerText = updatedUser.accountNumber;
    
    // Calculate Financial Aggregates
    const txs = DB.getTransactions().filter(t => 
      t.senderAccountNumber === updatedUser.accountNumber || 
      t.receiverAccountNumber === updatedUser.accountNumber
    );

    let totalIncome = 0;
    let totalExpenses = 0;
    let transfersCount = 0;

    txs.forEach(t => {
      if (t.type === 'deposit') {
        totalIncome += t.amount;
      } else if (t.type === 'withdraw') {
        totalExpenses += t.amount;
      } else if (t.type === 'transfer') {
        if (t.senderAccountNumber === updatedUser.accountNumber) {
          totalExpenses += t.amount;
          transfersCount++;
        } else if (t.receiverAccountNumber === updatedUser.accountNumber) {
          totalIncome += t.amount;
        }
      }
    });

    // Calculate Savings Vault (Arbitrary 25% of current balance for mock realism)
    const savingsBalance = updatedUser.balance * 0.25;
    const displayAvailable = updatedUser.balance - savingsBalance;

    // Set counters targets
    const balanceEl = document.getElementById('balance-val');
    const incomeEl = document.getElementById('stat-income');
    const expensesEl = document.getElementById('stat-expenses');
    const savingsEl = document.getElementById('stat-savings');
    const transfersEl = document.getElementById('stat-transfers');

    // Trigger animations
    setTimeout(() => {
      Utils.animateCounter(balanceEl, 0, displayAvailable, 1000);
      Utils.animateCounter(incomeEl, 0, totalIncome, 1000);
      Utils.animateCounter(expensesEl, 0, totalExpenses, 1000);
      Utils.animateCounter(savingsEl, 0, savingsBalance, 1000);
      Utils.animateCounter(transfersEl, 0, transfersCount, 800);
    }, 100);

    // Render recent transactions (limit 5)
    renderRecentTransactions(txs, updatedUser);

    // Manage Show/Hide balance toggle
    const settings = DB.getSettings();
    let showBalance = settings.showBalance !== false; // Default true
    
    const balanceBtn = document.getElementById('btn-toggle-balance');

    const updateBalanceState = (animate = false) => {
      if (showBalance) {
        balanceEl.classList.remove('balance-hidden');
        balanceBtn.innerHTML = '<i class="far fa-eye-slash"></i> Hide Balance';
        if (animate) {
          Utils.animateCounter(balanceEl, 0, displayAvailable, 600);
        } else {
          balanceEl.innerText = Utils.formatCurrency(displayAvailable);
        }
      } else {
        balanceEl.classList.add('balance-hidden');
        balanceEl.innerText = '$ ••••••••';
        balanceBtn.innerHTML = '<i class="far fa-eye"></i> Show Balance';
      }
    };

    // Run on load
    updateBalanceState(false);

    // Remove existing listener to prevent duplicates
    const newBalanceBtn = balanceBtn.cloneNode(true);
    balanceBtn.parentNode.replaceChild(newBalanceBtn, balanceBtn);
    newBalanceBtn.addEventListener('click', () => {
      showBalance = !showBalance;
      settings.showBalance = showBalance;
      DB.saveSettings(settings);
      updateBalanceState(true);
    });
  };

  initDashboard();

  // Redraw dashboard dynamically if Supabase database sync updates local cache in the background
  document.addEventListener('supabase-sync-complete', () => {
    console.log("Supabase sync completed. Redrawing dashboard layout...");
    initDashboard();
  });
});

function renderRecentTransactions(txs, user) {
  const container = document.getElementById('recent-tx-list');
  const emptyState = document.getElementById('tx-empty-state');
  
  if (!container) return;
  container.innerHTML = '';

  const recentTxs = txs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recentTxs.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  recentTxs.forEach(t => {
    const row = document.createElement('tr');
    
    let badgeType = 'info';
    let typeText = t.type;
    let amountClass = 'amount-plus';
    let amountSign = '+';

    if (t.type === 'deposit') {
      badgeType = 'success';
      typeText = 'deposit';
    } else if (t.type === 'withdraw') {
      badgeType = 'warning';
      typeText = 'withdraw';
      amountClass = 'amount-minus';
      amountSign = '-';
    } else if (t.type === 'transfer') {
      if (t.senderAccountNumber === user.accountNumber) {
        badgeType = 'danger';
        typeText = 'transfer sent';
        amountClass = 'amount-minus';
        amountSign = '-';
      } else {
        badgeType = 'success';
        typeText = 'transfer recd';
      }
    }

    const description = t.type === 'transfer' 
      ? (t.senderAccountNumber === user.accountNumber ? `To: ${t.receiverName}` : `From: ${t.senderName}`)
      : t.description;

    row.innerHTML = `
      <td style="padding:12px 16px; font-family:monospace; font-weight:600; color:var(--text-primary);">${t.id}</td>
      <td style="padding:12px 16px;">${Utils.formatDate(t.date, 'relative')}</td>
      <td style="padding:12px 16px; font-weight:500; color:var(--text-primary);">${Utils.sanitize(description)}</td>
      <td style="padding:12px 16px;"><span class="badge badge-${badgeType}">${typeText}</span></td>
      <td style="padding:12px 16px; text-align:right;" class="${amountClass}">${amountSign}${Utils.formatCurrency(t.amount)}</td>
    `;

    container.appendChild(row);
  });
}
