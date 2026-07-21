/* Email Center Controller — two-panel mail reader */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const filterSelect = document.getElementById('email-view-filter');
  
  const loadEmails = () => {
    const view = filterSelect ? filterSelect.value : 'my-inbox';
    renderEmailList(user, view);
  };

  loadEmails();

  filterSelect?.addEventListener('change', loadEmails);
});

function renderEmailList(user, view = 'my-inbox') {
  const container = document.getElementById('email-list-container');
  const emptyEl = document.getElementById('email-empty');
  const countEl = document.getElementById('email-count');

  // Fetch emails based on selected filter option
  let emails = [];
  if (view === 'all-logs') {
    emails = MailServer.getAllEmails();
  } else {
    emails = MailServer.getReceivedEmails(user.email);
  }

  if (countEl) countEl.innerText = `${emails.length} message${emails.length !== 1 ? 's' : ''}`;

  if (!container) return;
  container.innerHTML = '';

  // Clear current active detail state
  const placeholder = document.getElementById('email-placeholder');
  const detailPanel = document.getElementById('email-detail-panel');
  if (placeholder) placeholder.style.display = 'flex';
  if (detailPanel) detailPanel.classList.remove('active');

  if (emails.length === 0) {
    emptyEl?.classList.remove('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');

  // Sort newest first
  const sorted = [...emails].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((email) => {
    const item = document.createElement('div');
    item.className = 'email-list-item';

    // Show first ~80 chars of body as preview
    const preview = (email.body || '').replace(/\n/g, ' ').substring(0, 80) + '...';

    item.innerHTML = `
      <div class="email-icon"><i class="far fa-envelope"></i></div>
      <div class="email-meta">
        <div class="email-subject">${Utils.sanitize(email.subject)}</div>
        <div class="email-preview">${Utils.sanitize(preview)}</div>
      </div>
      <div class="email-date">${Utils.formatDate(email.date, 'relative')}</div>
    `;

    item.addEventListener('click', () => {
      // Remove active state from all items
      document.querySelectorAll('.email-list-item').forEach(el => el.style.background = '');
      item.style.background = 'var(--primary-light)';

      openEmail(email);
    });

    container.appendChild(item);
  });
}

function openEmail(email) {
  const placeholder = document.getElementById('email-placeholder');
  const detailPanel = document.getElementById('email-detail-panel');

  if (placeholder) placeholder.style.display = 'none';
  if (detailPanel) {
    detailPanel.classList.add('active');
    document.getElementById('detail-subject').innerText = email.subject;
    document.getElementById('detail-to').innerText = `To: ${email.to}`;
    document.getElementById('detail-date').innerText = Utils.formatDate(email.date);
    // Render body — use iframe for HTML emails, plain text fallback otherwise
    const bodyEl = document.getElementById('detail-body');
    if (bodyEl) {
      if (email.html) {
        // Render rich HTML email in a sandboxed iframe
        bodyEl.innerHTML = `<iframe
          id="email-html-frame"
          sandbox="allow-same-origin"
          style="width:100%;min-height:480px;border:none;border-radius:8px;background:#f4f4f5;"
          srcdoc="${email.html.replace(/"/g, '&quot;')}"
          title="Email preview"
        ></iframe>`;
        // Auto-resize iframe to content height after render
        const iframe = document.getElementById('email-html-frame');
        if (iframe) {
          iframe.onload = () => {
            try {
              const h = iframe.contentDocument.body.scrollHeight;
              if (h > 0) iframe.style.minHeight = h + 'px';
            } catch (e) { /* cross-origin guard */ }
          };
        }
      } else {
        bodyEl.style.whiteSpace = 'pre-wrap';
        bodyEl.innerText = email.body || '';
      }
    }

    const statusBadge = document.getElementById('detail-status');
    if (statusBadge) {
      statusBadge.innerText = email.status || "Delivered (Mock)";
      
      // Update badge visual styling based on status
      const statusText = (email.status || "").toLowerCase();
      statusBadge.className = 'badge'; // reset
      
      if (statusText.includes('success') || statusText.includes('delivered')) {
        statusBadge.classList.add('badge-success');
        statusBadge.innerHTML = `<i class="fas fa-check-circle"></i> ${email.status}`;
      } else if (statusText.includes('sending') || statusText.includes('progress')) {
        statusBadge.classList.add('badge-info');
        statusBadge.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${email.status}`;
      } else if (statusText.includes('failed') || statusText.includes('error')) {
        statusBadge.classList.add('badge-danger');
        statusBadge.innerHTML = `<i class="fas fa-times-circle"></i> ${email.status}`;
      } else {
        statusBadge.classList.add('badge-warning');
        statusBadge.innerHTML = `<i class="fas fa-question-circle"></i> ${email.status}`;
      }
    }
  }
}
