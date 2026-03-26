// pushes news, emails, updates the stock based on dialogue

(function () {

  // stock state
  let stockPrice = 184.72;
  let stockUp = true;

  // small random tick every 15 seconds for ambient anxiety
  setInterval(() => {
    const delta = (Math.random() - 0.45) * 1.5; // slight upward bias
    setStockPrice(stockPrice + delta);
  }, 15000);

  function setStockPrice(price) {
    stockPrice = Math.round(price * 100) / 100;
    const priceEl  = document.getElementById('stock-price');
    const changeEl = document.getElementById('stock-change');
    if (!priceEl) return;

    priceEl.textContent = '$' + stockPrice.toFixed(2);

    const diff = stockPrice - 184.72;
    const pct  = ((diff / 184.72) * 100).toFixed(2);
    const sign = diff >= 0 ? '+' : '';

    changeEl.textContent = (diff >= 0 ? '▲ ' : '▼ ') + sign + diff.toFixed(2) + ' (' + sign + pct + '%)';
    changeEl.className = 'stock-change ' + (diff >= 0 ? 'positive' : 'negative');
  }

  // stock crash sequence (for data leak ending)
  function crashStock() {
    const widget = document.getElementById('stock-widget');
    if (widget) widget.classList.add('crashing');

    const bars = document.querySelectorAll('.chart-bar');
    const crashes = [85, 60, 40, 25, 12, 8, 5, 3, 4, 2];
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.height = crashes[i] + '%';
        bar.classList.add('negative');
      }, i * 150);
    });

    // price drops in steps
    const dropSteps = [172.50, 155.20, 131.80, 108.44, 87.30, 62.15, 43.90];
    dropSteps.forEach((price, i) => {
      setTimeout(() => setStockPrice(price), 500 + i * 400);
    });

    // update revenue & market cap
    setTimeout(() => {
      const rev = document.getElementById('revenue-value');
      const cap = document.getElementById('marketcap-value');
      const status = document.getElementById('stock-status');
      if (rev) rev.textContent = '$1.1B';
      if (cap) cap.textContent = '$21.2B';
      if (status) {
        status.textContent = '⚠ TRADING HALTED — PENDING INVESTIGATION';
        status.style.color = '#c62828';
        status.style.fontWeight = 'bold';
      }
    }, 3500);
  }

  // add a news article
  function addNews(time, headline, body, isBreaking) {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    const article = document.createElement('div');
    article.className = 'news-article' + (isBreaking ? ' breaking' : '');

    const timeEl = document.createElement('span');
    timeEl.className = 'news-time';
    timeEl.textContent = (isBreaking ? '!!! BREAKING — ' : '') + time;

    const headlineEl = document.createElement('span');
    headlineEl.className = 'news-headline';
    headlineEl.textContent = headline;

    const bodyEl = document.createElement('p');
    bodyEl.className = 'news-body';
    bodyEl.textContent = body;

    article.appendChild(timeEl);
    article.appendChild(headlineEl);
    article.appendChild(bodyEl);

    // newest on top
    newsList.insertBefore(article, newsList.firstChild);
  }

  // add an email to inbox
  function addEmail(from, subject, bodyHTML) {
    const emailList = document.getElementById('email-list');
    const emailTitle = document.querySelector('#email-window .title-bar-text');
    if (!emailList) return;

    // count existing unread
    const unreadCount = emailList.querySelectorAll('.email-item.unread').length + 1;
    if (emailTitle) emailTitle.textContent = 'Baagle Mail — Inbox (' + unreadCount + ')';

    const item = document.createElement('div');
    item.className = 'email-item unread';
    item.innerHTML =
      '<span class="email-from">' + from + '</span>' +
      '<span class="email-subject">' + subject + '</span>' +
      '<span class="email-date">Today</span>';

    // store the email body as a data attribute (click is handled by desktop.js delegation)
    item.dataset.body = bodyHTML;

    // newest on top
    emailList.insertBefore(item, emailList.firstChild);

    // update the desktop icon badge with new unread count
    const badge = document.getElementById('email-badge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    }
  }

  // open news window with flash
  function forceOpenNews() {
    if (window.WindowControl) {
      window.WindowControl.openWindow('news-window');
    }
  }

  //open email window 
  function forceOpenEmail() {
    if (window.WindowControl) {
      window.WindowControl.openWindow('email-window');
    }
  }


  // EVENT DEFINITIONS - keyed by dialogue node ID
  // when a node is shown, its events fire
  const nodeEvents = {

    // morning - ambient news
    midmorning_check: function () {
      addNews(
        '10:15 AM',
        'Baagle Corp Expands AI Monitoring to All Departments',
        'The company announced today that its Wellness & Productivity Suite will be rolled out company-wide by end of quarter. Shares rose 1.3% on the news.',
        false
      );
      setStockPrice(186.40);
    },

    // afternoon - things get heavier
    afternoon_start: function () {
      addEmail(
        'BaagleBot v3.1',
        'Your Morning Performance Summary',
        '<p><strong>From:</strong> BaagleBot v3.1 &lt;bot@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> Your Morning Performance Summary</p><hr>' +
        '<p>Your morning session has been evaluated.</p>' +
        '<p>Tasks completed: <strong>7 / 14</strong></p>' +
        '<p>Keystroke consistency: <strong>68%</strong></p>' +
        '<p>Break compliance: <strong>Under Review</strong></p>' +
        '<p><em>This report has been filed with HR and your performance review committee.</em></p>'
      );
      addNews(
        '12:30 PM',
        'Employee Advocacy Group Questions Baagle Corp Monitoring Practices',
        'A small group of anonymous employees has raised concerns about the extent of workplace surveillance at Baagle Corp. A company spokesperson called the claims "exaggerated."',
        false
      );
    },

    afternoon_grind: function () {
      setStockPrice(188.10);
      addNews(
        '2:45 PM',
        'Baagle Corp Partners with DataHarvest Inc. for "Employee Wellness" Analytics',
        'Sources confirm Baagle Corp has signed a multi-year data-sharing agreement with DataHarvest Inc., a firm specializing in behavioral prediction models.',
        false
      );
    },

    webcam_confront: function () {
      addEmail(
        'IT Security',
        'Webcam Compliance Notice',
        '<p><strong>From:</strong> IT Security &lt;security@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> Webcam Compliance Notice</p><hr>' +
        '<p>This is an automated notice. Your workstation webcam is required to remain active during work hours per Section 22-B of your employment agreement.</p>' +
        '<p>Any obstruction will be logged as a compliance violation.</p>' +
        '<p><em>— IT Security Division</em></p>'
      );
    },

    webcam_cover: function () {
      addEmail(
        'IT Security',
        '⚠ COMPLIANCE VIOLATION — Camera Obstruction Detected',
        '<p><strong>From:</strong> IT Security &lt;security@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> ⚠ COMPLIANCE VIOLATION</p><hr>' +
        '<p>A compliance violation has been automatically recorded on your account.</p>' +
        '<p><strong>Violation:</strong> Webcam feed obstruction — 3:35 PM</p>' +
        '<p><strong>Status:</strong> Escalated to management</p>' +
        '<p>Further violations may result in disciplinary action.</p>'
      );
    },

    escalate_security: function () {
      addNews(
        '4:50 PM',
        'RUMOR: Internal Baagle Corp Leak Alleges Unauthorized Data Exports',
        'Unverified reports suggest an employee may have discovered unauthorized data transfers to external vendors. Baagle Corp has not commented.',
        true
      );
      setStockPrice(180.50);
    },

    //actually in story

    existential_crisis_quit2_track1: function () {
      addEmail(
        'Baagle HR',
        'PERFORMACE REWARD',
        '<p><strong>From:</strong> Baagle HR &lt;hr@bmail.com&gt;</p>' +
        '<p><strong>Subject:</strong> PERFORMACE REWARD</p><hr>' +
        '<p><strong>Congratulations!</strong></p>' +
        '<p>For your stellar performace over the last weeks, Baagle would like to reward you.</p>' +
        '<p>Please accept this 50€ gift card and an invitation to the next company dinner as a sign of our gratitude.</p>' +
        '<p><strong>PRODUCTIVITY IS A VIRTUE!</strong></p>' +
        '<p>Kind Regards,</p>' +
        '<p>Baagle HR Department</p>'
      );
    },

    confidentiality2_track1: function () {
      addEmail(
        'Baagle HR',
        'CONFIDENTIALITY BREACH',
        '<p><strong>From:</strong> Baagle HR &lt;hr@bmail.com&gt;</p>' +
        '<p><strong>Subject:</strong> CONFIDENTIALITY BREACH</p><hr>' +
        '<p>We have been informed about a confidentiality breach initiated by you. Please consider this a warning and dont ask the AI Chat Bot for employee information again.</p>' +
        '<p>Remember: <strong>PRODUCTIVITY IS A VIRTUE!</strong></p>' +
        '<p>Sincerely,</p>' +
        '<p>Baagle HR Department</p>'
      );
    },

    raise_issue3_track2: function () {
      addEmail(
        'Baagle Management',
        'Re: Employee Issue',
        '<p><strong>From:</strong> IT Security &lt;management@bmail.com&gt;</p>' +
        '<p><strong>Subject:</strong>Re: Employee Issue</p><hr>' +
        '<p>Thank you for reporting this issue. management will look into it.</p>' +
        '<p>Remember: <strong>PRODUCTIVITY IS A VIRTUE!</strong></p>' +
        '<p><strong>Status:</strong> Escalated to management</p>' +
        '<p>Kind Regards,</p>' +
        '<p>Baagle Management</p>'
      );
    },

    // endings

    quit_ending: function () {
      addEmail(
        'Baagle HR',
        'Employment Terminated',
        '<p><strong>From:</strong> Baagle HR &lt;hr@bmail.com&gt;</p>' +
        '<p><strong>Subject:</strong> Termination of Employment</p><hr>' +
        '<p>Baagle is sorry to see you leave your position. Please notice that your performance was not sufficient for the christmas pay-out this year. Furthermore Baagle is currently be unable to write a letter of recommendation fro your next employer. Thank you for your understanding.</p>' +
        '<p>Remember: <strong>PRODUCTIVITY IS A VIRTUE!</strong></p>' +
        '<p>Sincerely,</p>' +
        '<p>Baagle HR Department</p>'
      );
      setTimeout(forceOpenEmail, 2000);
      setStockPrice(173.90); // barely affected - you're replaceable
      setTimeout(() => {
        addNews(
          '7:12 PM',
          'Wave of Employees leaving Baagle Corp',
          'Recent criticism concerning Baagle Corporations new AI-first strategy, weak data protection laws and the increasing pressures of productivity have let to a wave of employees leaving the corporation. When asked for a statement, former workers reasons for terminating their contract reached from "unbearable work environment", to "an unfathomable amount of complete boredom". One employee states she "felt like a [redacted] robot, except Baagle would treat those better. I want AI to do my boring tasks so I can be creative, not the other way around!" Baagle Corp has been asked for a statement but there has been no response yet.',
          false
        );
        forceOpenNews();
      }, 1000);
      setTimeout(() => {
        addNews(
          '8:26 AM',
          'Overall Productivity Increasing at Baagle Corp',
          'Following controvercy around Baagle Corp\'s AI-first strategy, the company published a statement showing that overall productivity and customer satiffaction show promising results despite employees leaving Baagle. "Turns out, we did not need these employees anymore anyways", a Baagle spokesperson adds. While investors look positively upon the first revenue numbers, privacy activists and labor unions watch with increasing scepticism. Subscribe to our newsletter to not miss future developements!',
          false
        );
      }, 8000);
    },

    ending_fired: function () {
      addEmail(
        'HR Department',
        'Employment Termination Notice — Effective Immediately',
        '<p><strong>From:</strong> HR Department &lt;hr@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> Employment Termination Notice</p><hr>' +
        '<p>Dear Employee #00247,</p>' +
        '<p>Following your performance evaluation, we regret to inform you that your employment with Baagle Corp. has been terminated effective immediately.</p>' +
        '<p><strong>Reason:</strong> Failure to meet minimum productivity threshold.</p>' +
        '<p>Your final paycheck and severance details will be mailed to your address on file. Your workstation access has been revoked.</p>' +
        '<p><em>— Human Resources, Baagle Corp</em></p>'
      );
      setTimeout(forceOpenEmail, 2000);
      setStockPrice(185.90); // barely affected - you're replaceable
      addNews(
        '5:15 PM',
        'Baagle Corp Reports Workforce Reduction in Underperforming Units',
        'Baagle Corp confirmed it has "optimized staffing" in several departments, citing AI-driven performance analytics as the basis for decisions. "As an AI-first company we can be more effective with less resouces", a spokesperson from Baagle commented.',
        false
      );
    },

    //STILL THE TEXT FROM BURNOUT - CHANGE
    ending_employee: function () {
      addEmail(
        'HR Department',
        'Employee of the month',
        '<p><strong>From:</strong> HR Department &lt;hr@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> Employment Recognition </p><hr>' +
        '<p>Dear Employee #00247,</p>' +
        '<p> After your fantastic performance evaluation, we are pleased  to award you with the Employee of the Month certificate!</p>' +
        '<p><strong>Bonus:</strong> For your tiger-like tenacity, you also receive a 20% discount in Baagle merchandise upon proof of email at the counter, Enjoy!</p>' +
        '<p> Reminder: Discount is valid for 5 working days. </p>' +
        '<p><em>— Human Resources, Baagle Corp</em></p>'
      );
      setTimeout(forceOpenEmail, 1000);
      addEmail(
        'HR Department',
        'Mandatory Wellness Recovery Program — Enrollment Confirmation',
        '<p><strong>From:</strong> HR Department &lt;hr@baaglecorp.com&gt;</p>' +
        '<p><strong>Subject:</strong> Mandatory Wellness Recovery Program</p><hr>' +
        '<p>Dear Employee #00247,</p>' +
        '<p>Congratulations on your exceptional output today! However, our wellness systems have detected critically elevated stress biomarkers.</p>' +
        '<p>You have been auto-enrolled in the <strong>Mandatory Wellness Recovery Program</strong>.</p>' +
        '<p><strong>New schedule:</strong> 6:00 AM - 6:00 PM, Mon-Sat</p>' +
        '<p><strong>Includes:</strong> Increased monitoring frequency, guided task pacing, mandatory meal plan</p>' +
        '<p><em>Participation is not optional.</em></p>' +
        '<p>— Human Resources, Baagle Corp</p>'
      );
      setTimeout(forceOpenEmail, 2000);
      addNews(
        '5:05 PM',
        'BREAKING: 6 working days instead of 5? Baagle employees agree',
        'Baagle’s HR department looks to take a new leap in the industry by implementing a 6 working day strategy, inspired by new heights of performance metrics being attained through brute force. ',
        true
      );
      setStockPrice(191.30); // stock goes UP - you're being exploited profitably
      addNews(
        '5:10 PM',
        'Baagle Corp Stock Climbs as Productivity Metrics Hit Record Highs',
        'Analysts credit the company\'s AI-managed workforce program, noting that output-per-employee is up 34% year-over-year. Employee satisfaction surveys were not mentioned.',
        false
      );
    },

    ending_dataleak: function () {
      // staggered chaos sequence
      setTimeout(() => {
        addNews(
          '5:05 PM',
          'BREAKING: Massive Data Breach at Baagle Corp - Employee Data leaked to Third Parties',
          'Internal documents leaked by a whistleblower reveal that Baagle Corp has been collecting massive amounts of employee data - including browser history, clicks, keystrokes, email activity and chats with the company\'s newly implemented AI chat bot. The data of all 10,000 employees is believed to be compromised. What remains unclear is HOW the data got out of Baagle\'s internal network and into the hands of third parties.',
          true
        );
        forceOpenNews();
      }, 1000);

      setTimeout(() => {
        crashStock();
      }, 2500);

      setTimeout(() => {
        addNews(
          '5:20 PM',
          'BREAKING: LLM jailbreak responsible for data leak?',
          'In an internal investigation at Baagle Corp. an LLM instructions by a former employee was found which allowed the chat bot to sidestep the safeguard of the system and leak employee data. The even is described in the media as the greatest data breach of this decade. An additional employee was identified whose actions indirectly lead to the leak, now both the whistleblower and the current employee are expected to face not only termination but also legal consequeces.',
          true
        );
      }, 4000);

      setTimeout(() => {
        addEmail(
          'Baagle Corp Legal',
          'URGENT: Legal Hold Notice - Do Not Delete Any Files',
          '<p><strong>From:</strong> Legal Department &lt;legal@bmail.com&gt;</p>' +
          '<p><strong>Subject:</strong> URGENT - Legal Hold Notice</p><hr>' +
          '<p>Employee #00247,</p>' +
          '<p>You are hereby notified that a <strong>legal hold</strong> has been placed on all company data, communications, and records.</p>' +
          '<p>You are <strong>prohibited</strong> from deleting, modifying, or transferring any files on your workstation.</p>' +
          '<p>Additionally, your access logs and chat transcripts have been flagged for review in connection with an ongoing investigation into unauthorized data access.</p>' +
          '<p><strong>You are required to make yourself available for an interview with the legal team within 48 hours.</strong></p>' +
          '<p><em>— Baagle Corp Legal Department</em></p>'
        );
        forceOpenEmail();
      }, 6000);

      setTimeout(() => {
        addNews(
          '5:35 PM',
          'BREAKING: Baagle Corp Sues Employee in the midst of data breach scandal',
          'A current employee of Baagle Corporation has been sues in the current data leak case. Sources reveal that the employee handeled data irresposibly and reportedly internal logs show an overreliance on the company internal AI assitant, sparking public debate on the dangers of AI over-reliance.',
          true
        );
      }, 8000);
    }
  };

  // public API - called by chatbot.js after showing a node 
  function triggerNodeEvents(nodeId) {
    if (nodeEvents[nodeId]) {
      nodeEvents[nodeId]();
    }
  }

  window.GameEvents = { triggerNodeEvents, addNews, addEmail, crashStock, setStockPrice };
})();