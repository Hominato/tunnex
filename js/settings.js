/* Settings Page Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  const settings = DB.getSettings();
  const currentTheme = DB.getTheme();

  // 1. Populate theme toggles
  const darkToggle = document.getElementById('dark-mode-toggle');
  const systemToggle = document.getElementById('system-theme-toggle');
  const timeoutSelect = document.getElementById('timeout-select');

  if (currentTheme === 'system') {
    systemToggle.checked = true;
    darkToggle.checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
    darkToggle.disabled = true;
  } else {
    darkToggle.checked = currentTheme === 'dark';
  }

  if (timeoutSelect) {
    timeoutSelect.value = String(settings.sessionTimeoutMinutes || 15);
  }

  // System theme toggle
  systemToggle.addEventListener('change', () => {
    if (systemToggle.checked) {
      DB.saveTheme('system');
      darkToggle.disabled = true;
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      Utils.showToast('Theme', 'Now following system preference.', 'info');
    } else {
      darkToggle.disabled = false;
      // Pin to current display state
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      DB.saveTheme(isDark ? 'dark' : 'light');
    }
  });

  // Dark mode toggle (only when system is off)
  darkToggle.addEventListener('change', () => {
    if (systemToggle.checked) return;
    const theme = darkToggle.checked ? 'dark' : 'light';
    DB.saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    Utils.showToast('Theme Changed', `Switched to ${theme} mode.`, 'success');
  });

  // Timeout select
  timeoutSelect?.addEventListener('change', () => {
    settings.sessionTimeoutMinutes = parseInt(timeoutSelect.value);
    DB.saveSettings(settings);
    Utils.showToast('Settings Saved', `Session timeout set to ${timeoutSelect.value} minutes.`, 'success');
  });

  // Supabase Connection Form
  const supabaseForm = document.getElementById('supabase-connect-form');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');
  
  if (supabaseForm) {
    supabaseUrlInput.value = settings.supabaseUrl || '';
    supabaseKeyInput.value = settings.supabaseKey || '';
    
    supabaseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();
      
      settings.supabaseUrl = url;
      settings.supabaseKey = key;
      
      DB.saveSettings(settings);
      
      Utils.showToast('Supabase Saved', 'Credentials updated. Redrawing database session...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    });
  }



  // 2. Password toggle buttons
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = input.type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    });
  });

  // 3. Change Password form
  document.getElementById('change-password-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = document.getElementById('current-password').value;
    const newPw = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-new-password').value;

    if (current !== user.password) {
      Utils.showToast('Wrong Password', 'Current password is incorrect.', 'error');
      return;
    }
    if (newPw !== confirm) {
      Utils.showToast('Mismatch', 'New passwords do not match.', 'error');
      return;
    }

    user.password = newPw;
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) users[idx].password = newPw;
    DB.saveUsers(users);
    DB.setCurrentUser(user);
    e.target.reset();
    Utils.showToast('Password Updated', 'Your password has been changed successfully.', 'success');
  });

  // 4. Backup
  document.getElementById('backup-btn')?.addEventListener('click', () => {
    const backup = {
      users: DB.getUsers(),
      transactions: DB.getTransactions(),
      notifications: DB.getNotifications(),
      emails: DB.getEmails(),
      settings: DB.getSettings(),
      theme: DB.getTheme(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CommBank_Backup_${Date.now()}.json`;
    a.click();
    Utils.showToast('Backup Ready', 'Database exported as JSON file.', 'success');
  });

  // 5. Restore
  document.getElementById('restore-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.users || !data.transactions) throw new Error('Invalid format');
        if (!confirm('This will overwrite all current data. Continue?')) return;

        if (data.users) DB.saveUsers(data.users);
        if (data.transactions) DB.saveTransactions(data.transactions);
        if (data.notifications) DB.saveNotifications(data.notifications);
        if (data.emails) DB.saveEmails(data.emails);
        if (data.settings) DB.saveSettings(data.settings);
        if (data.theme) DB.saveTheme(data.theme);

        Utils.showToast('Restored!', 'Database imported successfully. Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      } catch {
        Utils.showToast('Invalid File', 'The selected file is not a valid Compressive Savings Bank of Texas backup.', 'error');
      }
    };
    reader.readAsText(file);
  });

  // 6. Clear Notifications
  document.getElementById('clear-notif-btn')?.addEventListener('click', () => {
    if (!confirm('Clear all your notifications?')) return;
    const notes = DB.getNotifications().filter(n => n.userId !== user.id);
    DB.saveNotifications(notes);
    Utils.showToast('Cleared', 'All notifications removed.', 'info');
  });

  // 7. Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    DB.clearCurrentUser();
    Utils.showToast('Signed Out', 'Your session has ended.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1000);
  });
});
