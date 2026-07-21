/* Withdrawal Transaction Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const balanceEl = document.getElementById('current-balance');
  const form = document.getElementById('withdraw-form');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');
  const errorMsg = document.getElementById('withdraw-error-msg');

  // Set initial balance display
  balanceEl.innerText = Utils.formatCurrency(user.balance);

  // Hook Quick Preset buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountInput.value = btn.getAttribute('data-val');
      amountInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  // Handle withdraw form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      Utils.showToast("Validation Error", "Please review withdrawal rules.", "warning");
      amountInput.classList.add('user-invalid-fallback');
      return;
    }

    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim() || "ATM Withdrawal";

    // Overdraft validation
    if (amount > user.balance) {
      errorMsg.innerText = `Insufficient funds. Your available balance is $${user.balance.toLocaleString()}.00.`;
      amountInput.classList.add('user-invalid-fallback');
      Utils.showToast("Insufficient Balance", "You cannot withdraw more than your available balance.", "error");
      return;
    }

    // 1. Update User Balance
    user.balance -= amount;
    
    // Update users array in DB
    const users = DB.getUsers();
    const userIdx = users.findIndex(u => u.id === user.id);
    if (userIdx !== -1) {
      users[userIdx].balance = user.balance;
      DB.saveUsers(users);
    }
    
    // Update currentUser session
    DB.setCurrentUser(user);

    // 2. Log Transaction
    const txId = Utils.genId('TXN');
    const txn = {
      id: txId,
      type: 'withdraw',
      senderAccountNumber: user.accountNumber,
      senderName: user.fullName,
      receiverAccountNumber: 'SYSTEM',
      receiverName: 'ATM Cash Terminal',
      amount: amount,
      description: description,
      date: new Date().toISOString()
    };
    
    const txs = DB.getTransactions();
    txs.unshift(txn);
    DB.saveTransactions(txs);

    // 3. Create Notification
    const noteId = Utils.genId('NTF');
    const note = {
      id: noteId,
      userId: user.id,
      type: 'danger',
      title: `Debit Alert ($${amount.toLocaleString()})`,
      description: `Your account was debited with $${amount.toLocaleString()}.00 via ${description}.`,
      read: false,
      date: new Date().toISOString()
    };
    
    const notes = DB.getNotifications();
    notes.unshift(note);
    DB.saveNotifications(notes);

    // If balance falls below a threshold, trigger low balance alert
    if (user.balance < 10000) {
      const warningNote = {
        id: Utils.genId('NTF'),
        userId: user.id,
        type: 'warning',
        title: 'Low Balance Warning',
        description: 'Your balance is below the recommended threshold of $10,000.00.',
        read: false,
        date: new Date().toISOString()
      };
      notes.unshift(warningNote);
      DB.saveNotifications(notes);
    }

    // 4. Update display & Alert
    balanceEl.innerText = Utils.formatCurrency(user.balance);
    Utils.showToast("Withdrawal Processed", `Successfully debited ${Utils.formatCurrency(amount)}.`, "success");
    
    form.reset();

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  });
});
