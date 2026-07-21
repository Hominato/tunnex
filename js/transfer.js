/* Peer-to-Peer & Inter-Bank Transfer Transaction Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const balanceEl = document.getElementById('current-balance');
  const form = document.getElementById('transfer-form');
  const bankInput = document.getElementById('bank-name');
  const nameInput = document.getElementById('recipient-name-input');
  const emailInput = document.getElementById('recipient-email');
  const accountInput = document.getElementById('recipient-account');
  const amountInput = document.getElementById('amount');
  const descInput = document.getElementById('description');
  const submitBtn = document.getElementById('btn-submit');
  const searchResultCard = document.getElementById('search-result-card');

  balanceEl.innerText = Utils.formatCurrency(user.balance);

  let foundRecipient = null;

  // Lookup internal recipient if bank is Compressive Savings Bank of Texas
  let lookupTimer;
  const doLookup = () => {
    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(() => {
      const bank = bankInput.value.trim().toLowerCase();
      const email = emailInput.value.trim().toLowerCase();
      const account = accountInput.value.trim();

      // Reset internal lookup state
      searchResultCard.classList.add('hidden');
      foundRecipient = null;

      // Only search database if bank is Compressive Savings Bank of Texas
      const isInternalBank = bank.includes('commonwealth') || bank.includes('commbank') || bank.includes('cb');
      if (!isInternalBank || !email || !account || account.length !== 10) return;

      const users = DB.getUsers();
      const recipient = users.find(u => u.email === email && u.accountNumber === account);

      if (!recipient) return;

      if (recipient.id === user.id) {
        Utils.showToast('Invalid Recipient', 'Cannot transfer to yourself.', 'warning');
        return;
      }

      // Found matching internal user!
      foundRecipient = recipient;
      nameInput.value = recipient.fullName;
      document.getElementById('recipient-details').innerText = `Matched internal customer: ${recipient.fullName} (${recipient.customerId})`;
      searchResultCard.classList.remove('hidden');
    }, 400);
  };

  emailInput.addEventListener('input', doLookup);
  accountInput.addEventListener('input', doLookup);
  bankInput.addEventListener('input', doLookup);

  // Show confirmation modal on form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const bankName = bankInput.value.trim();
    const recipientName = nameInput.value.trim();
    const recipientEmail = emailInput.value.trim();
    const recipientAccount = accountInput.value.trim();
    const amount = parseFloat(amountInput.value);

    // Basic form validation checks
    if (!bankName || !recipientName || !recipientEmail || !recipientAccount) {
      Utils.showToast('Validation Error', 'Please fill in all recipient details.', 'warning');
      return;
    }

    if (recipientAccount.length !== 10) {
      Utils.showToast('Invalid Account', 'Account number must be 10 digits.', 'warning');
      return;
    }

    if (!amount || amount < 10) {
      Utils.showToast('Invalid Amount', 'Minimum transfer amount is $10.', 'warning');
      return;
    }

    if (amount > user.balance) {
      document.getElementById('transfer-error-msg').innerText = `Insufficient balance. Available: ${Utils.formatCurrency(user.balance)}.`;
      amountInput.classList.add('user-invalid-fallback');
      Utils.showToast('Insufficient Balance', 'You do not have enough funds.', 'error');
      return;
    }

    // Populate confirmation modal
    document.getElementById('confirm-recipient-bank').innerText = bankName;
    document.getElementById('confirm-recipient-name').innerText = recipientName;
    document.getElementById('confirm-recipient-account').innerText = recipientAccount;
    document.getElementById('confirm-amount').innerText = Utils.formatCurrency(amount);
    document.getElementById('confirm-total').innerText = Utils.formatCurrency(amount);

    Utils.openModal('confirm-modal');
  });

  // Final confirm button action
  document.getElementById('btn-final-confirm').addEventListener('click', () => {
    const bankName = bankInput.value.trim();
    const recipientName = nameInput.value.trim();
    const recipientEmail = emailInput.value.trim();
    const recipientAccount = accountInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim() || `Transfer to ${recipientName}`;

    Utils.closeModal('confirm-modal');
    processTransfer(user, bankName, recipientName, recipientAccount, recipientEmail, amount, description, foundRecipient);
  });

  // Light dismiss on backdrop
  document.querySelector('#confirm-modal .modal-backdrop').addEventListener('click', () => {
    Utils.closeModal('confirm-modal');
  });
});

function processTransfer(sender, bankName, receiverName, receiverAccount, receiverEmail, amount, description, internalRecipient) {
  const users = DB.getUsers();
  const txs = DB.getTransactions();
  const notes = DB.getNotifications();
  const now = new Date().toISOString();
  const txId = Utils.genId('TXN');

  // 1. Deduct sender balance
  const senderIdx = users.findIndex(u => u.id === sender.id);
  users[senderIdx].balance -= amount;

  // 2. Credit receiver if internal, otherwise process as external routing
  let isInternal = false;
  if (internalRecipient) {
    const receiverIdx = users.findIndex(u => u.id === internalRecipient.id);
    if (receiverIdx !== -1) {
      users[receiverIdx].balance += amount;
      isInternal = true;
    }
  }

  DB.saveUsers(users);

  // Update sender session
  DB.setCurrentUser(users[senderIdx]);

  // 3. Log transaction ledger entry
  const txn = {
    id: txId,
    type: 'transfer',
    senderAccountNumber: sender.accountNumber,
    senderName: sender.fullName,
    receiverAccountNumber: receiverAccount,
    receiverName: receiverName,
    receiverBank: bankName,
    amount: amount,
    description: description,
    date: now
  };
  txs.unshift(txn);
  DB.saveTransactions(txs);

  // 4. Sender in-app notification alert
  notes.unshift({
    id: Utils.genId('NTF'),
    userId: sender.id,
    type: 'danger',
    title: `Transfer Sent (${Utils.formatCurrency(amount)})`,
    description: `You sent ${Utils.formatCurrency(amount)} to ${receiverName} (${bankName}). Ref: ${txId}.`,
    read: false,
    date: now
  });

  // 5. Receiver notification (Only if internal customer)
  if (isInternal && internalRecipient) {
    notes.unshift({
      id: Utils.genId('NTF'),
      userId: internalRecipient.id,
      type: 'success',
      title: `Money Received (${Utils.formatCurrency(amount)})`,
      description: `You received ${Utils.formatCurrency(amount)} from ${sender.fullName}. Ref: ${txId}.`,
      read: false,
      date: now
    });
  }

  DB.saveNotifications(notes);

  // 6. HTML Debit Alert → Sender
  const txDate    = new Date(now).toLocaleString('en-AU');
  const debitEml  = MailServer.buildDebitEmail(
    sender.fullName,
    Utils.formatCurrency(amount),
    receiverName,
    receiverAccount,
    bankName,
    txId,
    txDate,
    Utils.formatCurrency(users[senderIdx].balance)
  );
  MailServer.sendEmail(
    sender.email,
    debitEml.subject,
    debitEml.html,
    `Debit: ${Utils.formatCurrency(amount)} sent to ${receiverName}. Ref: ${txId}`
  );

  // 7. HTML Credit Alert → Recipient
  const creditEml = MailServer.buildCreditEmail(
    receiverName,
    Utils.formatCurrency(amount),
    sender.fullName,
    receiverAccount,
    bankName,
    txId,
    txDate,
    description
  );
  MailServer.sendEmail(
    receiverEmail,
    creditEml.subject,
    creditEml.html,
    `Credit: ${Utils.formatCurrency(amount)} received from ${sender.fullName}. Ref: ${txId}`
  );

  Utils.showToast('Transfer Successful!', `${Utils.formatCurrency(amount)} sent to ${receiverName}.`, 'success');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1800);
}
