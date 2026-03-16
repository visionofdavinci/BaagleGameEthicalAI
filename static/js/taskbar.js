/* needs to update clock every few seconds, adds and removes taskbar buttons when wondows open or close */

(function () {
  const taskbarTabs = document.getElementById('taskbar-tabs');
  const clock = document.getElementById('clock');

  // clock
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    clock.textContent = h12 + ':' + minutes + ' ' + ampm;
  }

  updateClock();
  setInterval(updateClock, 10000); // update every 10 seconds

  // helpers
  function getTabForWindow(id) {
    return taskbarTabs.querySelector('.taskbar-tab[data-window="' + id + '"]');
  }

  function getWindowTitle(id) {
    const win = document.getElementById(id);
    if (!win) return id;
    const text = win.querySelector('.title-bar-text');
    return text ? text.textContent : id;
  }

  function getWindowIcon(id) {
    const win = document.getElementById(id);
    if (!win) return '';
    const icon = win.querySelector('.title-bar-icon');
    return icon ? icon.src : '';
  }

  // mark the active tab (matches focused window)
  function setActiveTab(id) {
    taskbarTabs.querySelectorAll('.taskbar-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    const tab = getTabForWindow(id);
    if (tab) {
      tab.classList.remove('minimized');
      tab.classList.add('active');
    }
  }

  // window opened so add tab if not already there
  window.addEventListener('window-opened', (e) => {
    const id = e.detail.id;
    let tab = getTabForWindow(id);

    if (!tab) {
      tab = document.createElement('button');
      tab.className = 'taskbar-tab';
      tab.dataset.window = id;

      const iconSrc = getWindowIcon(id);
      if (iconSrc) {
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = '';
        tab.appendChild(img);
      }

      const label = document.createElement('span');
      label.textContent = getWindowTitle(id);
      tab.appendChild(label);

      // clicking the tab toggles the window
      tab.addEventListener('click', () => {
        const win = document.getElementById(id);
        if (!win) return;

        if (win.classList.contains('minimized')) {
          // restore from minimized
          win.classList.remove('minimized');
          win.style.display = 'block';
          if (window.WindowControl) window.WindowControl.openWindow(id);
        } else if (tab.classList.contains('active')) {
          // already focused - minimize it
          win.classList.add('minimized');
          tab.classList.remove('active');
          tab.classList.add('minimized');
        } else {
          // bring to front
          if (window.WindowControl) window.WindowControl.openWindow(id);
        }
      });

      taskbarTabs.appendChild(tab);
    }

    setActiveTab(id);
  });

  // window closed so remove tab
  window.addEventListener('window-closed', (e) => {
    const tab = getTabForWindow(e.detail.id);
    if (tab) tab.remove();
  });

  // window minimized so mark tab as minimized
  window.addEventListener('window-minimized', (e) => {
    const tab = getTabForWindow(e.detail.id);
    if (tab) {
      tab.classList.remove('active');
      tab.classList.add('minimized');
    }
  });

  //start button click? then Baagglebor notification
  const startBtn = document.getElementById('start-button');
const notification = document.getElementById('notification-popup');
const notifClose = notification ? notification.querySelector('.notification-close') : null;

// array of messages - can rotate or escalate later
const startMessages = [
  'Did you need something? Get back to work.',
  'The Start menu has been disabled for productivity reasons.',
  'This action has been logged. Your manager has been notified.',
  'Fun fact: top performers never click Start. Just saying.',
  'Are you looking for something? I can help - if you get back to your tasks first.',
];

let messageIndex = 0;

if (startBtn && notification) {
  startBtn.addEventListener('click', () => {
    // pick the next message (cycles through them)
    const body = notification.querySelector('.notification-body p');
    if (body) body.textContent = startMessages[messageIndex % startMessages.length];
    messageIndex++;

    // show notification
    notification.classList.remove('hidden', 'fade-out');

    // auto-dismiss after 5 seconds
    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.classList.add('hidden'), 300);
    }, 5000);
  });

  // manual close
  if (notifClose) {
    notifClose.addEventListener('click', () => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.classList.add('hidden'), 300);
    });
  }
}

})();