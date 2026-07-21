/* Shared Banking Frontend Utility Functions */

const Utils = (() => {
  // 1. Currency formatter (AUD)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // 2. Date formatter (Relative or localized string)
  const formatDate = (dateString, format = 'medium') => {
    const d = new Date(dateString);
    if (format === 'relative') {
      const now = new Date();
      const diff = now - d;
      const secs = Math.floor(diff / 1000);
      const mins = Math.floor(secs / 60);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);

      if (secs < 60) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return 'Yesterday';
      return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    }
    
    return d.toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 3. XSS Sanitization to clean inputs
  const sanitize = (text) => {
    if (typeof text !== 'string') return text;
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
  };

  // 4. Generate transaction/notification IDs
  const genId = (prefix) => {
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}${rand}`;
  };

  // 5. JavaScript Number Counter Animation
  const animateCounter = (element, start, end, duration = 1000) => {
    if (!element) return;
    let startTime = null;
    
    // Parse isCurrency from display value
    const isCurrency = element.classList.contains('count-currency');

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = progress * (end - start) + start;
      
      element.innerText = isCurrency ? formatCurrency(currentVal) : Math.floor(currentVal).toLocaleString();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = isCurrency ? formatCurrency(end) : end.toLocaleString();
      }
    };

    window.requestAnimationFrame(step);
  };

  // 6. Stackable Toast Notifications Manager
  const showToast = (title, desc, type = 'info', duration = 4000) => {
    // Check if container exists, otherwise create it
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
      <div class="toast-body">
        <div class="toast-title">${sanitize(title)}</div>
        <div class="toast-desc">${sanitize(desc)}</div>
      </div>
      <div class="toast-close"><i class="fas fa-times"></i></div>
    `;

    container.appendChild(toast);

    // Force reflow and show transition
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Auto dismiss handler
    const dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, duration);

    // Manual click close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(dismissTimer);
      dismissToast(toast);
    });
  };

  const dismissToast = (toast) => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  };

  // 7. Modals controller
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  };

  // 8. Create dynamic page navigation drawer controllers (mobile)
  const initMobileSidebar = () => {
    const hamburger = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburger && sidebar) {
      // Backdrop element
      let backdrop = document.querySelector('.sidebar-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
      }

      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
      });
    }
  };

  return {
    formatCurrency,
    formatDate,
    sanitize,
    genId,
    animateCounter,
    showToast,
    openModal,
    closeModal,
    initMobileSidebar
  };
})();
