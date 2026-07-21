/* Chart.js Aggregations & Data Visualization Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = DB.getCurrentUser();
  if (!user) return;

  // Retrieve user-specific transactions
  const txs = DB.getTransactions().filter(t => 
    t.senderAccountNumber === user.accountNumber || 
    t.receiverAccountNumber === user.accountNumber
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological order

  // Fetch computed CSS variables for theme-aware chart colors
  const style = getComputedStyle(document.documentElement);
  const getThemeColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                   (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return {
      text: isDark ? '#cbd5e1' : '#475569',
      border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      primary: isDark ? '#818cf8' : '#4f46e5',
      primaryLight: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(79, 70, 229, 0.1)',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
  };

  let colors = getThemeColors();

  // Watch for theme changes dynamically to redraw charts with correct colors
  const themeObserver = new MutationObserver(() => {
    colors = getThemeColors();
    updateChartThemeColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    colors = getThemeColors();
    updateChartThemeColors();
  });

  // Keep references to destroy/recreate chart instances on theme updates
  let charts = {};

  // 1. DATA PREPARATION FOR CHARTS
  
  // Weekly Activity (Spent by day of week - last 7 days)
  const getWeeklyData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const spentByDay = [0, 0, 0, 0, 0, 0, 0];
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    txs.forEach(t => {
      const txDate = new Date(t.date);
      if (txDate >= sevenDaysAgo) {
        const isDebit = t.type === 'withdraw' || (t.type === 'transfer' && t.senderAccountNumber === user.accountNumber);
        if (isDebit) {
          spentByDay[txDate.getDay()] += t.amount;
        }
      }
    });

    // Rotate array so current day is last
    const todayIndex = new Date().getDay();
    const labels = [];
    const data = [];
    for (let i = 0; i < 7; i++) {
      const idx = (todayIndex - 6 + i + 7) % 7;
      labels.push(days[idx].substring(0, 3));
      data.push(spentByDay[idx]);
    }
    return { labels, data };
  };

  // Monthly Income Trend (Line Chart - last 6 months)
  const getMonthlyIncomeData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeByMonth = {};
    
    // Default last 6 months to 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      incomeByMonth[`${d.getFullYear()}-${d.getMonth()}`] = {
        label: months[d.getMonth()],
        amount: 0
      };
    }

    txs.forEach(t => {
      const txDate = new Date(t.date);
      const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
      if (incomeByMonth[key] !== undefined) {
        const isCredit = t.type === 'deposit' || (t.type === 'transfer' && t.receiverAccountNumber === user.accountNumber);
        if (isCredit) {
          incomeByMonth[key].amount += t.amount;
        }
      }
    });

    const labels = [];
    const data = [];
    Object.values(incomeByMonth).forEach(m => {
      labels.push(m.label);
      data.push(m.amount);
    });

    return { labels, data };
  };

  // Expense Category Breakdown (Doughnut Chart)
  const getExpenseBreakdownData = () => {
    let transferSum = 0;
    let withdrawalSum = 0;
    let utilitiesSum = 0;
    
    txs.forEach(t => {
      const isDebit = t.type === 'withdraw' || (t.type === 'transfer' && t.senderAccountNumber === user.accountNumber);
      if (isDebit) {
        if (t.type === 'withdraw') {
          withdrawalSum += t.amount;
        } else if (t.type === 'transfer') {
          transferSum += t.amount;
        }
        
        // Categorize utility bills from description keywords
        const desc = t.description.toLowerCase();
        if (desc.includes('bill') || desc.includes('utility') || desc.includes('dstv') || desc.includes('electric') || desc.includes('airtime')) {
          utilitiesSum += t.amount;
        }
      }
    });

    // Make sure we have some mock data if there are no debits yet
    if (transferSum === 0 && withdrawalSum === 0 && utilitiesSum === 0) {
      return {
        labels: ['Transfers', 'Withdrawals', 'Utilities'],
        data: [15000, 20000, 5000]
      };
    }

    return {
      labels: ['Transfers', 'Withdrawals', 'Utilities/Bills'],
      data: [transferSum, withdrawalSum, utilitiesSum]
    };
  };

  // Wealth Accumulation Timeline (Area Chart)
  const getBalanceGrowthData = () => {
    let currentSum = 100000; // Registration Default
    const labels = ['Reg Bonus'];
    const data = [100000];

    // Find initial seed tx if exists to reset cumulative start correctly
    const systemTx = txs.find(t => t.senderAccountNumber === 'SYSTEM');
    if (systemTx) {
      currentSum = systemTx.amount;
      labels[0] = new Date(systemTx.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
      data[0] = currentSum;
    }

    txs.forEach(t => {
      if (t.id === systemTx?.id) return; // Skip welcome
      
      const isCredit = t.type === 'deposit' || (t.type === 'transfer' && t.receiverAccountNumber === user.accountNumber);
      if (isCredit) {
        currentSum += t.amount;
      } else {
        currentSum -= t.amount;
      }
      labels.push(new Date(t.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }));
      data.push(currentSum);
    });

    // Limit to last 10 points to avoid chart clutter
    return {
      labels: labels.slice(-10),
      data: data.slice(-10)
    };
  };

  // 2. INITIALIZE CHART CANVAS INSTANCES
  
  const initCharts = () => {
    // A. Weekly Spent Chart
    const weekly = getWeeklyData();
    const ctxWeekly = document.getElementById('weekly-spending-chart')?.getContext('2d');
    if (ctxWeekly) {
      charts.weekly = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
          labels: weekly.labels,
          datasets: [{
            label: 'Amount Debited ($)',
            data: weekly.data,
            backgroundColor: colors.primary,
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: colors.text } },
            y: { grid: { color: colors.border }, ticks: { color: colors.text, callback: val => '$' + val.toLocaleString() } }
          }
        }
      });
    }

    // B. Expense Breakdown Doughnut
    const breakdown = getExpenseBreakdownData();
    const ctxDoughnut = document.getElementById('expense-doughnut-chart')?.getContext('2d');
    if (ctxDoughnut) {
      charts.breakdown = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: breakdown.labels,
          datasets: [{
            data: breakdown.data,
            backgroundColor: [colors.error, colors.warning, colors.info],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: colors.text, font: { family: 'Poppins' } }
            }
          },
          cutout: '70%'
        }
      });
    }

    // C. Monthly Income Chart
    const monthly = getMonthlyIncomeData();
    const ctxLine = document.getElementById('monthly-income-chart')?.getContext('2d');
    if (ctxLine) {
      charts.monthly = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: monthly.labels,
          datasets: [{
            label: 'Monthly Credits',
            data: monthly.data,
            borderColor: colors.success,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: colors.text } },
            y: { grid: { color: colors.border }, ticks: { color: colors.text } }
          }
        }
      });
    }

    // D. Balance Growth Chart
    const growth = getBalanceGrowthData();
    const ctxGrowth = document.getElementById('balance-growth-chart')?.getContext('2d');
    if (ctxGrowth) {
      charts.growth = new Chart(ctxGrowth, {
        type: 'line',
        data: {
          labels: growth.labels,
          datasets: [{
            label: 'Net Worth Balance',
            data: growth.data,
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            fill: true,
            tension: 0.3,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: colors.text } },
            y: { grid: { color: colors.border }, ticks: { color: colors.text } }
          }
        }
      });
    }
  };

  const updateChartThemeColors = () => {
    // Destroy existing instances to draw again with current colors
    Object.values(charts).forEach(c => c.destroy());
    initCharts();
  };

  // First draw
  initCharts();
});
