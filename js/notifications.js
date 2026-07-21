/* Notifications Center Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  renderNotifications(user);

  document.getElementById('mark-all-btn')?.addEventListener('click', () => {
    const notes = DB.getNotifications().map(n => {
      if (n.userId === user.id) n.read = true;
      return n;
    });
    DB.saveNotifications(notes);
    renderNotifications(user);
    Utils.showToast('All Read', 'All notifications marked as read.', 'success');
  });

  document.getElementById('clear-all-btn')?.addEventListener('click', () => {
    if (!confirm('Clear all notifications? This cannot be undone.')) return;
    const notes = DB.getNotifications().filter(n => n.userId !== user.id);
    DB.saveNotifications(notes);
    renderNotifications(user);
    Utils.showToast('Cleared', 'All notifications have been removed.', 'info');
  });

  // Dynamically redraw notification items once Supabase completes sync
  document.addEventListener('supabase-sync-complete', () => {
    renderNotifications(user);
  });
});

function renderNotifications(user) {
  const container = document.getElementById('notifications-list');
  const emptyEl = document.getElementById('notif-empty');
  const unreadBadge = document.getElementById('unread-count-badge');
  if (!container) return;

  const allNotes = DB.getNotifications().filter(n => n.userId === user.id);
  const unreadCount = allNotes.filter(n => !n.read).length;

  if (unreadBadge) {
    unreadBadge.innerText = `${unreadCount} Unread`;
    unreadBadge.className = `badge ${unreadCount > 0 ? 'badge-danger' : 'badge-success'}`;
  }

  container.innerHTML = '';

  if (allNotes.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  // Sort newest first
  const sorted = [...allNotes].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(note => {
    const iconMap = {
      success: { icon: 'fa-check-circle', bg: 'var(--success-light)', color: 'var(--success-color)' },
      danger: { icon: 'fa-arrow-up-right-dots', bg: 'var(--error-light)', color: 'var(--error-color)' },
      warning: { icon: 'fa-exclamation-triangle', bg: 'var(--warning-light)', color: 'var(--warning-color)' },
      info: { icon: 'fa-info-circle', bg: 'var(--info-light)', color: 'var(--info-color)' }
    };
    const style = iconMap[note.type] || iconMap.info;

    const item = document.createElement('div');
    item.className = `notification-item${note.read ? '' : ' unread'}`;
    item.innerHTML = `
      <div class="notification-icon-wrap" style="background:${style.bg}; color:${style.color};">
        <i class="fas ${style.icon}"></i>
      </div>
      <div class="notification-body">
        <div class="notification-title">${Utils.sanitize(note.title)}</div>
        <div class="notification-desc">${Utils.sanitize(note.description)}</div>
        <div class="notification-time"><i class="far fa-clock"></i> ${Utils.formatDate(note.date, 'relative')}</div>
      </div>
      ${!note.read ? '<div style="width:8px; height:8px; background:var(--primary-color); border-radius:50%; flex-shrink:0; margin-top:6px;"></div>' : ''}
    `;

    // Mark as read on click
    item.addEventListener('click', () => {
      const notes = DB.getNotifications().map(n => {
        if (n.id === note.id) n.read = true;
        return n;
      });
      DB.saveNotifications(notes);
      item.classList.remove('unread');
      item.querySelector('div[style*="border-radius:50%"]')?.remove();
      renderNotifications(user); // refresh badge count
    });

    container.appendChild(item);
  });
}
