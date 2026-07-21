/* User Authentication & Session Script */

document.addEventListener('DOMContentLoaded', () => {
  // Sync page theme immediately
  const savedTheme = DB.getTheme();
  if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // 1. Password Visibility Toggle Action
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="far fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<i class="far fa-eye"></i>';
      }
    });
  });

  // 2. Sync ARIA attributes on input fields (a11y)
  const syncAria = (el) => {
    el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
  };
  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
  });

  // 3. User Registration Form Handling
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    // Custom inline validations
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const phone = document.getElementById('phone').value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

      // Duplicate validations
      const users = DB.getUsers();
      
      const emailExists = users.some(u => u.email === email);
      if (emailExists) {
        Utils.showToast("Email Exists", "This email address is already registered.", "error");
        return;
      }

      const usernameExists = users.some(u => u.username === username);
      if (usernameExists) {
        Utils.showToast("Username Taken", "This username is already claimed.", "error");
        return;
      }

      if (password !== confirmPassword) {
        Utils.showToast("Password Mismatch", "Passwords do not match.", "error");
        return;
      }

      // Generate credentials
      const accountNumber = "10" + Math.floor(10000000 + Math.random() * 90000000); // 10 + 8 digits = 10 digits
      const customerId = "CUS" + Math.floor(100000 + Math.random() * 900000); // CUS + 6 digits
      const userId = Utils.genId('USR');

      const newUser = {
        id: userId,
        customerId: customerId,
        accountNumber: accountNumber,
        fullName: fullName,
        username: username,
        email: email,
        phone: phone,
        password: password, // MVP Hashing mock
        balance: 100000,
        profileImage: "avatar" + (Math.floor(Math.random() * 5) + 1), // Assign random default avatar
        address: "",
        createdAt: new Date().toISOString()
      };

      // Add to users db
      users.push(newUser);
      DB.saveUsers(users);

      // Generate seed transaction for register balance ($100,000)
      const txn = {
        id: Utils.genId('TXN'),
        type: 'deposit',
        senderAccountNumber: 'SYSTEM',
        senderName: 'Compressive Savings Bank of Texas Reserve',
        receiverAccountNumber: accountNumber,
        receiverName: fullName,
        amount: 100000,
        description: 'Account Welcome Bonus Credit',
        date: new Date().toISOString()
      };
      const txs = DB.getTransactions();
      txs.unshift(txn);
      DB.saveTransactions(txs);

      // Generate notifications
      const welcomeNote = {
        id: Utils.genId('NTF'),
        userId: userId,
        type: 'success',
        title: 'Welcome to Compressive Savings Bank of Texas!',
        description: 'Your account has been credited with $100,000.00 welcome bonus.',
        read: false,
        date: new Date().toISOString()
      };
      const notes = DB.getNotifications();
      notes.unshift(welcomeNote);
      DB.saveNotifications(notes);

      // Dispatch welcome email (HTML)
      const welcomeEmail = MailServer.buildWelcomeEmail(fullName, customerId, accountNumber);
      MailServer.sendEmail(email, welcomeEmail.subject, welcomeEmail.html, `Welcome to Compressive Savings Bank of Texas, ${fullName}. Account: ${accountNumber}`);

      // Log session
      DB.setCurrentUser(newUser);
      
      // Toast notification & redirect
      Utils.showToast("Registration Successful", "Setting up your banking terminal...", "success");
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    });
  }

  // 4. User Login Form Handling
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const usernameOrEmail = document.getElementById('username').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe')?.checked;

      const users = DB.getUsers();
      const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);

      if (!user) {
        Utils.showToast("Authentication Failed", "Invalid username/email or password.", "error");
        return;
      }

      // Session initiation
      DB.setCurrentUser(user);

      // Trigger login alerts notifications
      const loginNote = {
        id: Utils.genId('NTF'),
        userId: user.id,
        type: 'info',
        title: 'Successful Login Alert',
        description: `Logged in from web terminal at ${new Date().toLocaleTimeString()}.`,
        read: false,
        date: new Date().toISOString()
      };
      const notes = DB.getNotifications();
      notes.unshift(loginNote);
      DB.saveNotifications(notes);

      // Login security alert email (HTML)
      const loginEmail = MailServer.buildLoginEmail(user.fullName, new Date().toLocaleString('en-AU'));
      MailServer.sendEmail(user.email, loginEmail.subject, loginEmail.html, `Login alert for ${user.fullName} at ${new Date().toLocaleString()}`);

      Utils.showToast("Login Successful", "Decrypting terminal keys...", "success");
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    });
  }
});
