/* Transaction History Controller — search, filter, sort, paginate, export */

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let filteredTxs = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = DB.getCurrentUser();
  if (!currentUser) return;

  // Set print metadata
  const printUserInfo = document.getElementById('print-user-info');
  const printDate = document.getElementById('print-date');
  if (printUserInfo) printUserInfo.innerText = `Account: ${currentUser.fullName} · Acc No: ${currentUser.accountNumber} · ID: ${currentUser.customerId}`;
  if (printDate) printDate.innerText = new Date().toLocaleString('en-AU');

  loadHistory();

  document.getElementById('search-input')?.addEventListener('input', () => { currentPage = 1; loadHistory(); });
  document.getElementById('type-filter')?.addEventListener('change', () => { currentPage = 1; loadHistory(); });
  document.getElementById('sort-select')?.addEventListener('change', () => { currentPage = 1; loadHistory(); });
});

function loadHistory() {
  const searchQuery = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
  const typeFilter = document.getElementById('type-filter')?.value || '';
  const sortVal = document.getElementById('sort-select')?.value || 'newest';

  // Get all txs involving current user
  let txs = DB.getTransactions().filter(t =>
    t.senderAccountNumber === currentUser.accountNumber ||
    t.receiverAccountNumber === currentUser.accountNumber
  );

  // Apply type filter
  if (typeFilter) {
    txs = txs.filter(t => {
      if (typeFilter === 'deposit') return t.type === 'deposit';
      if (typeFilter === 'withdraw') return t.type === 'withdraw';
      if (typeFilter === 'transfer-sent') return t.type === 'transfer' && t.senderAccountNumber === currentUser.accountNumber;
      if (typeFilter === 'transfer-received') return t.type === 'transfer' && t.receiverAccountNumber === currentUser.accountNumber;
      return true;
    });
  }

  // Apply search filter
  if (searchQuery) {
    txs = txs.filter(t =>
      t.id.toLowerCase().includes(searchQuery) ||
      t.description?.toLowerCase().includes(searchQuery) ||
      t.senderName?.toLowerCase().includes(searchQuery) ||
      t.receiverName?.toLowerCase().includes(searchQuery) ||
      t.senderAccountNumber?.includes(searchQuery) ||
      t.receiverAccountNumber?.includes(searchQuery)
    );
  }

  // Apply sort
  txs.sort((a, b) => {
    if (sortVal === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortVal === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortVal === 'highest') return b.amount - a.amount;
    if (sortVal === 'lowest') return a.amount - b.amount;
    return 0;
  });

  filteredTxs = txs;
  document.getElementById('result-count').innerText = txs.length;
  renderPage(currentPage);
  renderPagination();
}

function renderPage(page) {
  const tbody = document.getElementById('history-table-body');
  const emptyEl = document.getElementById('history-empty');
  if (!tbody) return;

  tbody.innerHTML = '';

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageTxs = filteredTxs.slice(start, end);

  if (filteredTxs.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  pageTxs.forEach(t => {
    const isDebit = t.type === 'withdraw' || (t.type === 'transfer' && t.senderAccountNumber === currentUser.accountNumber);
    const amountClass = isDebit ? 'amount-minus' : 'amount-plus';
    const sign = isDebit ? '-' : '+';

    let badgeType = 'info', typeLabel = t.type;
    if (t.type === 'deposit') { badgeType = 'success'; typeLabel = 'Deposit'; }
    else if (t.type === 'withdraw') { badgeType = 'warning'; typeLabel = 'Withdrawal'; }
    else if (t.type === 'transfer' && isDebit) { badgeType = 'danger'; typeLabel = 'Sent'; }
    else if (t.type === 'transfer' && !isDebit) { badgeType = 'success'; typeLabel = 'Received'; }

    const counterparty = t.type === 'transfer'
      ? (isDebit ? `To: ${t.receiverName}` : `From: ${t.senderName}`)
      : (isDebit ? t.receiverName : t.senderName);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:14px 16px; font-family:monospace; font-size:0.8rem; color:var(--text-muted);">${t.id}</td>
      <td style="padding:14px 16px; font-size:0.85rem;">${Utils.formatDate(t.date)}</td>
      <td style="padding:14px 16px; font-weight:500; color:var(--text-primary);">${Utils.sanitize(t.description || '-')}</td>
      <td style="padding:14px 16px; font-size:0.85rem;">${Utils.sanitize(counterparty || '-')}</td>
      <td style="padding:14px 16px;"><span class="badge badge-${badgeType}">${typeLabel}</span></td>
      <td style="padding:14px 16px; text-align:right;" class="${amountClass}">${sign}${Utils.formatCurrency(t.amount)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination() {
  const bar = document.getElementById('pagination-bar');
  if (!bar) return;
  bar.innerHTML = '';

  const totalPages = Math.ceil(filteredTxs.length / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderPage(currentPage); renderPagination(); } };
  bar.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn${i === currentPage ? ' active' : ''}`;
    btn.innerText = i;
    btn.onclick = () => { currentPage = i; renderPage(currentPage); renderPagination(); };
    bar.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPage(currentPage); renderPagination(); } };
  bar.appendChild(nextBtn);
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('type-filter').value = '';
  document.getElementById('sort-select').value = 'newest';
  currentPage = 1;
  loadHistory();
}

function exportCSV() {
  if (filteredTxs.length === 0) {
    Utils.showToast('No Data', 'No transactions to export.', 'warning');
    return;
  }

  const headers = ['Transaction ID', 'Date', 'Type', 'Description', 'Sender', 'Receiver', 'Amount (AUD)'];
  const rows = filteredTxs.map(t => {
    const isDebit = t.type === 'withdraw' || (t.type === 'transfer' && t.senderAccountNumber === currentUser.accountNumber);
    const typeLabel = t.type === 'deposit' ? 'Deposit' : t.type === 'withdraw' ? 'Withdrawal' : isDebit ? 'Transfer Sent' : 'Transfer Received';
    return [
      t.id,
      new Date(t.date).toLocaleString('en-AU'),
      typeLabel,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.senderName,
      t.receiverName,
      isDebit ? -t.amount : t.amount
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `CommBank_Statement_${currentUser.accountNumber}_${Date.now()}.csv`;
  link.click();
  Utils.showToast('Export Ready', 'CSV statement downloaded successfully.', 'success');
}
