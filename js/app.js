/* Global Page Shell, Session Guards & Layout Injection */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Bootstrapping & OS Preference Tracking
  const applyTheme = (theme) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Run immediately
  applyTheme(DB.getTheme());

  // Listen for OS system theme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (DB.getTheme() === 'system') {
      applyTheme('system');
    }
  });

  // 2. Authentication Route Guards
  const currentUser = DB.getCurrentUser();
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const publicPages = ['index.html', 'login.html', 'register.html', ''];
  const isInternalPage = !publicPages.includes(page);

  if (isInternalPage && !currentUser) {
    // Force sign in
    window.location.href = 'login.html';
    return;
  }

  // 3. Dynamic Shell Layout Injection (For internal dashboard pages)
  if (isInternalPage && currentUser) {
    injectSidebar(currentUser);
    injectTopBar(currentUser, page);
    setupSessionTimeout();
    
    // Register mobile Hamburger toggler actions
    Utils.initMobileSidebar();
  }
  
  // Custom interactive animations on card hover or sidebar
  animateCardsHover();
});

// Sidebar renderer
function injectSidebar(user) {
  const target = document.getElementById('sidebar-target');
  if (!target) return;

  // Count unread notifications
  const notes = DB.getNotifications().filter(n => n.userId === user.id && !n.read);
  const badgeHtml = notes.length > 0 ? `<span class="badge badge-danger" style="margin-left:auto; padding:2px 6px; font-size:0.7rem;">${notes.length}</span>` : '';

  // Get avatar SVG markup or placeholder
  const avatarSvg = getAvatarMarkup(user.profileImage, user.fullName);

  target.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="assets/logo.png" alt="Logo" style="width: 28px; height: 28px; flex-shrink: 0; display: inline-block; vertical-align: middle; margin-right: 8px; object-fit: contain;">
        <span>Compressive Savings Bank of Texas</span>
      </div>
      
      <ul class="nav-list">
        <li><a href="dashboard.html" class="nav-link" id="nav-dashboard"><i class="fas fa-chart-pie"></i>Dashboard</a></li>
        <li><a href="transfer.html" class="nav-link" id="nav-transfer"><i class="fas fa-paper-plane"></i>Transfer</a></li>
        <li><a href="deposit.html" class="nav-link" id="nav-deposit"><i class="fas fa-piggy-bank"></i>Deposit</a></li>
        <li><a href="withdraw.html" class="nav-link" id="nav-withdraw"><i class="fas fa-wallet"></i>Withdraw</a></li>
        <li><a href="history.html" class="nav-link" id="nav-history"><i class="fas fa-history"></i>History</a></li>
        <li><a href="notifications.html" class="nav-link" id="nav-notifications"><i class="fas fa-bell"></i>Notifications ${badgeHtml}</a></li>
        <li><a href="profile.html" class="nav-link" id="nav-profile"><i class="fas fa-user-circle"></i>Profile</a></li>
        <li><a href="settings.html" class="nav-link" id="nav-settings"><i class="fas fa-cog"></i>Settings</a></li>
        <li><a href="email-center.html" class="nav-link" id="nav-email-center"><i class="fas fa-envelope"></i>Email Center</a></li>
      </ul>
      
      <div class="sidebar-footer">
        <div class="user-snippet">
          <div class="user-avatar flex-center" id="sidebar-avatar">
            ${avatarSvg}
          </div>
          <div class="user-info">
            <span class="user-name" title="${Utils.sanitize(user.fullName)}">${Utils.sanitize(user.fullName)}</span>
            <span class="user-role" style="font-size:0.75rem;">ID: ${user.customerId}</span>
          </div>
        </div>
      </div>
    </aside>
  `;

  // Highlight active link
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'dashboard.html';
  const pageId = page.replace('.html', '');
  const activeLink = document.getElementById(`nav-${pageId}`);
  if (activeLink) activeLink.classList.add('active');
}

// Top navigation bar renderer
function injectTopBar(user, page) {
  const target = document.getElementById('topbar-target');
  if (!target) return;

  const title = target.getAttribute('data-title') || 'Dashboard';
  const subtitle = target.getAttribute('data-subtitle') || `Welcome back, ${user.fullName}`;

  const notes = DB.getNotifications().filter(n => n.userId === user.id && !n.read);
  const badgeDot = notes.length > 0 ? '<span class="badge-dot"></span>' : '';

  target.innerHTML = `
    <div class="top-bar">
      <div style="display: flex; align-items: center; gap: 16px;">
        <button class="hamburger-btn" aria-label="Toggle navigation drawer"><i class="fas fa-bars"></i></button>
        <img class="mobile-topbar-logo" src="assets/logo.png" alt="Logo">
        <div class="page-title">
          <h1>${Utils.sanitize(title)}</h1>
          <p>${Utils.sanitize(subtitle)}</p>
        </div>
      </div>
      
      <div class="top-actions">
        <span class="badge badge-info" style="font-weight:600;"><i class="fas fa-shield-alt"></i> Sandbox Mode</span>
        <a href="notifications.html" class="btn btn-icon notification-badge-btn" aria-label="Notifications panel">
          <i class="far fa-bell"></i>
          ${badgeDot}
        </a>
        <a href="profile.html" class="btn btn-icon" title="View Profile" aria-label="Profile details">
          <i class="far fa-user"></i>
        </a>
        <button id="global-logout" class="btn btn-outline" style="padding: 10px 16px;"><i class="fas fa-sign-out-alt"></i> Log Out</button>
      </div>
    </div>
  `;

  // Hook logout button
  document.getElementById('global-logout')?.addEventListener('click', () => {
    handleUserLogout();
  });
}

function handleUserLogout() {
  DB.clearCurrentUser();
  Utils.showToast("Logged Out", "Session ended. Returning to login...", "info");
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// 4. Session Timeout Watcher
function setupSessionTimeout() {
  const settings = DB.getSettings();
  const timeoutMinutes = settings.sessionTimeoutMinutes || 15;
  const timeoutMs = timeoutMinutes * 60 * 1000;
  
  let lastActivityTime = Date.now();

  const resetTimer = () => {
    lastActivityTime = Date.now();
  };

  // Activity events
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  document.addEventListener('click', resetTimer);
  document.addEventListener('scroll', resetTimer);

  // Check every 30 seconds
  const interval = setInterval(() => {
    if (Date.now() - lastActivityTime >= timeoutMs) {
      clearInterval(interval);
      Utils.showToast("Session Expired", `Inactivity timeout of ${timeoutMinutes}m triggered.`, "warning");
      setTimeout(() => {
        handleUserLogout();
      }, 2000);
    }
  }, 30000);
}

// 5. Shared avatars rendering utility (Uses inline premium SVGs)
function getAvatarMarkup(avatarId, fullName) {
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
  
  // Custom colored inline avatars
  const avatars = {
    avatar1: `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="#4f46e5"/><text x="50" y="55" font-family="Poppins" font-size="28" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`,
    avatar2: `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="#10b981"/><text x="50" y="55" font-family="Poppins" font-size="28" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`,
    avatar3: `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="#f59e0b"/><text x="50" y="55" font-family="Poppins" font-size="28" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`,
    avatar4: `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="#ef4444"/><text x="50" y="55" font-family="Poppins" font-size="28" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`,
    avatar5: `<svg viewBox="0 0 100 100" style="width:100%; height:100%;"><circle cx="50" cy="50" r="45" fill="#3b82f6"/><text x="50" y="55" font-family="Poppins" font-size="28" font-weight="700" fill="white" text-anchor="middle" alignment-baseline="middle">${initials}</text></svg>`,
  };

  // Base64 upload custom photo checks
  if (avatarId && avatarId.startsWith('data:image')) {
    return `<img src="${avatarId}" alt="User Avatar" style="width:100%; height:100%; object-fit:cover;">`;
  }

  return avatars[avatarId] || avatars.avatar1;
}

// 6. Subtle parallax mouse card tilts
function animateCardsHover() {
  const cards = document.querySelectorAll('.glass-interactive');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const tiltX = (yc - y) / 16;
      const tiltY = (x - xc) / 16;
      
      card.style.transform = `translateY(-2px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
    });
  });
}
