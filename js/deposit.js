/* Deposit Transaction Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const balanceEl = document.getElementById('current-balance');
  const form = document.getElementById('deposit-form');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');

  // Set initial balance display
  balanceEl.innerText = Utils.formatCurrency(user.balance);

  // Hook Quick Preset buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountInput.value = btn.getAttribute('data-val');
      // Trigger native validation styling update
      amountInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  // Handle deposit form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      Utils.showToast("Validation Error", "Please review deposit amount rules.", "warning");
      amountInput.classList.add('user-invalid-fallback');
      return;
    }

    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim() || "Sandbox Cash Deposit";

    // 1. Update User Balance
    user.balance += amount;
    
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
      type: 'deposit',
      senderAccountNumber: 'SYSTEM',
      senderName: 'Compressive Savings Bank of Texas Cash Agent',
      receiverAccountNumber: user.accountNumber,
      receiverName: user.fullName,
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
      type: 'success',
      title: `Deposit Successful ($${amount.toLocaleString()})`,
      description: `Your account was credited with $${amount.toLocaleString()}.00 via ${description}.`,
      read: false,
      date: new Date().toISOString()
    };
    
    const notes = DB.getNotifications();
    notes.unshift(note);
    DB.saveNotifications(notes);

    // 4. Update display & Alert
    balanceEl.innerText = Utils.formatCurrency(user.balance);
    Utils.showToast("Deposit Processed", `Successfully deposited ${Utils.formatCurrency(amount)}.`, "success");
    
    form.reset();

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  });
});
