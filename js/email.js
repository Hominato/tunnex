/* Compressive Savings Bank of Texas Digital Sandbox Mail Server System */

const MailServer = (() => {

  // ─────────────────────────────────────────────────────────────────────────
  // HTML EMAIL TEMPLATE ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  /** Build a professional HTML email from a structured options object.
   *  @param {object} opts
   *    - type        : 'welcome' | 'login' | 'debit' | 'credit' | 'deposit' | 'generic'
   *    - recipientName : string
   *    - subject     : string
   *    - intro       : string (opening paragraph)
   *    - rows        : Array<[label, value]> — rendered as a detail table
   *    - note        : string (optional small-print / footer note)
   */
  const buildHtml = (opts) => {
    const { recipientName, intro, rows = [], note = '', type = 'generic' } = opts;

    // Diamond logo SVG (inline, no external deps)
    const logoSvg = `
      <img src="assets/logo.png" alt="Logo" width="42" height="42" style="display:inline-block;vertical-align:middle;object-fit:contain;">`;

    // Status badge colour per email type
    const badgeColor = {
      welcome : '#16a34a',
      login   : '#2563eb',
      debit   : '#dc2626',
      credit  : '#16a34a',
      deposit : '#16a34a',
      generic : '#4b5563'
    }[type] || '#4b5563';

    const badgeLabel = {
      welcome : 'New Account',
      login   : 'Security Alert',
      debit   : 'Debit Alert',
      credit  : 'Credit Alert',
      deposit : 'Deposit Confirmed',
      generic : 'Notification'
    }[type] || 'Notification';

    // Build detail-table rows
    const tableRows = rows.map(([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;
                   border-bottom:1px solid #f3f4f6;white-space:nowrap;width:38%;">${label}</td>
        <td style="padding:10px 16px;font-size:13px;color:#111827;
                   border-bottom:1px solid #f3f4f6;word-break:break-word;">${value}</td>
      </tr>`).join('');

    const tableSection = rows.length > 0 ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;
                    overflow:hidden;margin:24px 0;">
        <tbody>${tableRows}</tbody>
      </table>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.subject || 'Compressive Savings Bank of Texas Notification'}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">

      <!-- Card -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;
                    overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:#000000;padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">${logoSvg}</td>
                <td style="vertical-align:middle;padding-left:12px;">
                  <span style="color:#FFCC00;font-size:20px;font-weight:700;
                               letter-spacing:0.5px;display:block;">Compressive Savings Bank of Texas</span>
                  <span style="color:#9ca3af;font-size:11px;display:block;margin-top:2px;">
                    Digital Banking Services
                  </span>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;background:${badgeColor};color:#fff;
                               font-size:11px;font-weight:700;padding:4px 12px;
                               border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">
                    ${badgeLabel}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── YELLOW ACCENT STRIPE ── -->
        <tr>
          <td style="background:#FFCC00;height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:36px 40px 28px;">

            <p style="margin:0 0 6px;font-size:15px;color:#6b7280;">Dear ${recipientName},</p>
            <p style="margin:0 0 20px;font-size:15px;color:#111827;line-height:1.6;">${intro}</p>

            ${tableSection}

            ${note ? `<p style="margin:20px 0 0;font-size:12px;color:#9ca3af;
                                 border-top:1px solid #f3f4f6;padding-top:16px;
                                 line-height:1.6;">${note}</p>` : ''}

          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:0;">
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:24px 40px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- CBA colours strip -->
                <td>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:32px;height:4px;background:#FFCC00;border-radius:2px 0 0 2px;"></td>
                      <td style="width:8px;"></td>
                      <td style="width:32px;height:4px;background:#000000;border-radius:0 2px 2px 0;"></td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 2px;font-size:12px;color:#374151;font-weight:700;">
                    Compressive Savings Bank of Texas
                  </p>
                  <p style="margin:0;font-size:11px;color:#9ca3af;">
                    compressivesavings@zohomail.com &nbsp;|&nbsp; compressivesavings@zohomail.com
                  </p>
                </td>
                <td align="right" style="vertical-align:bottom;">
                  <p style="margin:0;font-size:10px;color:#d1d5db;">
                    © ${new Date().getFullYear()} Compressive Savings Bank of Texas. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:16px 0 0;font-size:10px;color:#d1d5db;line-height:1.6;">
              This is an automated message from Compressive Savings Bank of Texas's secure digital notification system.
              Please do not reply to this email. If you did not request this notification,
              please contact us immediately at compressivesavings@zohomail.com.
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`;
  };


  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC EMAIL FACTORY METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /** Welcome / account opened email */
  const buildWelcomeEmail = (fullName, customerId, accountNumber) => ({
    subject : 'Welcome to Compressive Savings Bank of Texas — Account Activated',
    html    : buildHtml({
      type          : 'welcome',
      recipientName : fullName,
      subject       : 'Welcome to Compressive Savings Bank of Texas — Account Activated',
      intro         : 'Your Compressive Savings Bank of Texas Digital account has been successfully created and activated. Here are your account details for your records:',
      rows : [
        ['Full Name',       fullName],
        ['Customer ID',     customerId],
        ['Account Number',  accountNumber],
        ['Opening Balance', '$100,000.00 AUD'],
        ['Account Status',  '<span style="color:#16a34a;font-weight:700;">✔ Active</span>'],
        ['Date Opened',     new Date().toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric' })]
      ],
      note : '🔒 Keep your account number and Customer ID confidential. Never share your password or PIN with anyone, including bank staff.'
    })
  });

  /** Login security alert email */
  const buildLoginEmail = (fullName, timestamp) => ({
    subject : 'Security Alert — New Login Detected',
    html    : buildHtml({
      type          : 'login',
      recipientName : fullName,
      subject       : 'Security Alert — New Login Detected',
      intro         : 'A successful login was detected on your Compressive Savings Bank of Texas Digital account. If this was you, no action is needed.',
      rows : [
        ['Account Holder',  fullName],
        ['Login Time',      timestamp],
        ['Access Method',   'Web Terminal (Browser)'],
        ['Status',          '<span style="color:#16a34a;font-weight:700;">✔ Authorised</span>']
      ],
      note : '⚠️ If you did not perform this login, please contact our security team immediately at compressivesavings@zohomail.com and change your password right away.'
    })
  });

  /** Transfer debit alert (sent to sender) */
  const buildDebitEmail = (senderName, amount, receiverName, receiverAccount, bankName, txId, txDate, newBalance) => ({
    subject : `Debit Alert — ${amount} Transfer Processed`,
    html    : buildHtml({
      type          : 'debit',
      recipientName : senderName,
      subject       : `Debit Alert — ${amount} Transfer Processed`,
      intro         : `Your transfer of <strong>${amount}</strong> has been successfully processed. Please find the full transaction details below:`,
      rows : [
        ['Transaction ID',     txId],
        ['Amount Debited',     `<strong style="color:#dc2626;">${amount}</strong>`],
        ['Recipient Name',     receiverName],
        ['Recipient Account',  receiverAccount],
        ['Destination Bank',   bankName],
        ['Transaction Date',   txDate],
        ['Remaining Balance',  `<strong>${newBalance}</strong>`],
        ['Status',             '<span style="color:#16a34a;font-weight:700;">✔ Completed</span>']
      ],
      note : 'If you did not authorise this transaction, please contact Compressive Savings Bank of Texas Support immediately. Transfers may take 1–2 business days to fully settle with external institutions.'
    })
  });

  /** Transfer credit alert (sent to recipient) */
  const buildCreditEmail = (receiverName, amount, senderName, receiverAccount, bankName, txId, txDate, description) => ({
    subject : `Credit Notification — ${amount} Received`,
    html    : buildHtml({
      type          : 'credit',
      recipientName : receiverName,
      subject       : `Credit Notification — ${amount} Received`,
      intro         : `Great news! A credit of <strong>${amount}</strong> has been deposited into your account. Here are the full details:`,
      rows : [
        ['Transaction ID',    txId],
        ['Amount Credited',   `<strong style="color:#16a34a;">${amount}</strong>`],
        ['Sender Name',       senderName],
        ['Sending Bank',      bankName],
        ['Your Account',      receiverAccount],
        ['Reference',         description || 'N/A'],
        ['Transaction Date',  txDate],
        ['Status',            '<span style="color:#16a34a;font-weight:700;">✔ Credited</span>']
      ],
      note : 'Funds are typically available immediately for internal transfers. External transfers may take 1–2 business days to fully clear.'
    })
  });

  /** Deposit confirmation email */
  const buildDepositEmail = (recipientName, amount, depositorName, depositDate, accountNumber, txId) => ({
    subject : `Deposit Confirmed — ${amount} Credited`,
    html    : buildHtml({
      type          : 'deposit',
      recipientName : recipientName,
      subject       : `Deposit Confirmed — ${amount} Credited`,
      intro         : `A deposit of <strong>${amount}</strong> has been confirmed and credited to your account. Full details are shown below:`,
      rows : [
        ['Transaction ID',   txId],
        ['Amount Deposited', `<strong style="color:#16a34a;">${amount}</strong>`],
        ['Deposited By',     depositorName],
        ['Account Number',   accountNumber],
        ['Deposit Date',     depositDate],
        ['Status',           '<span style="color:#16a34a;font-weight:700;">✔ Confirmed</span>']
      ],
      note : 'This deposit has been fully processed and is reflected in your current balance. Contact us if you have any queries about this transaction.'
    })
  });


  // ─────────────────────────────────────────────────────────────────────────
  // CORE SEND ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  /** Primary send method.
   *  @param {string} to      - recipient email address
   *  @param {string} subject - email subject line
   *  @param {string} html    - full HTML body string
   *  @param {string} [plainText] - optional plain text fallback (for local log display)
   */
  const sendEmail = (to, subject, html, plainText = '') => {
    const emails   = DB.getEmails();
    const settings = DB.getSettings();

    // Respect the emailAlerts toggle — skip silently if disabled
    if (settings.emailAlerts === false) {
      console.log(`[MAIL] Skipped (emailAlerts disabled) → ${to} | Subject: "${subject}"`);
      return null;
    }

    const isLive   = settings.emailDeliveryMode === 'live';

    const newEmail = {
      id      : Utils.genId('EML'),
      to      : to.toLowerCase().trim(),
      subject : subject,
      body    : plainText || '(HTML email — view in email client)',
      html    : html,
      date    : new Date().toISOString(),
      status  : isLive ? 'Sending (Live)...' : 'Delivered (Mock)'
    };

    // Always log locally for the in-app Email Center
    emails.unshift(newEmail);
    DB.saveEmails(emails);

    console.log(`[MAIL] Queued → ${to} | Subject: "${subject}" | Mode: ${isLive ? 'Live' : 'Mock'}`);

    if (isLive) {
      const pubKey = settings.emailjsPublicKey;
      const svcId  = settings.emailjsServiceId;
      const tempId = settings.emailjsTemplateId;

      if (!pubKey || !svcId || !tempId) {
        console.warn('[MAIL] EmailJS credentials missing — falling back to mock.');
        newEmail.status = 'Delivered (Mock — Credentials Missing)';
        DB.saveEmails(emails);
        return newEmail;
      }

      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
          service_id      : svcId,
          template_id     : tempId,
          user_id         : pubKey,
          template_params : {
            to_email   : to.trim(),
            subject    : subject,
            message    : html,          // EmailJS template should render {{message}} as HTML
            from_name  : 'Compressive Savings Bank of Texas',
            from_email : 'compressivesavings@zohomail.com'
          }
        })
      })
      .then(res => {
        if (res.ok) {
          console.log(`[MAIL] Delivered → ${to} (Live)`);
          updateEmailStatus(newEmail.id, 'Delivered (Live)');
        } else {
          res.text().then(err => {
            console.error(`[MAIL] EmailJS error: ${err}`);
            updateEmailStatus(newEmail.id, `Failed (Live — ${err})`);
          });
        }
      })
      .catch(err => {
        console.error('[MAIL] Network error:', err);
        updateEmailStatus(newEmail.id, 'Failed (Live — Network Error)');
      });
    }

    return newEmail;
  };

  // Update email status after async live delivery
  const updateEmailStatus = (emailId, status) => {
    const emails = DB.getEmails();
    const idx    = emails.findIndex(e => e.id === emailId);
    if (idx !== -1) {
      emails[idx].status = status;
      DB.saveEmails(emails);

      // Refresh Email Center UI if visible
      const listEl = document.getElementById('email-list-container');
      if (listEl) {
        const user   = DB.getCurrentUser();
        const filter = document.getElementById('email-view-filter')?.value || 'my-inbox';
        if (user && typeof renderEmailList === 'function') {
          renderEmailList(user, filter);
        }
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // QUERY HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const getReceivedEmails = (userEmail) => {
    const emails = DB.getEmails();
    return emails.filter(em => em.to === userEmail.toLowerCase().trim());
  };

  const getAllEmails = () => DB.getEmails();

  // ─────────────────────────────────────────────────────────────────────────
  return {
    sendEmail,
    getReceivedEmails,
    getAllEmails,
    // Expose builders so auth.js / transfer.js can use them
    buildWelcomeEmail,
    buildLoginEmail,
    buildDebitEmail,
    buildCreditEmail,
    buildDepositEmail
  };
})();
