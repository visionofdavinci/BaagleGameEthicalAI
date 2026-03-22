/* start screen */

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const playButton = document.getElementById("play-button");

  playButton.addEventListener("click", () => {
  startScreen.classList.add("fade-out");

  setTimeout(() => {
    startScreen.style.display = "none";

    window.dispatchEvent(new Event("game-start"));
  }, 1000);
})
});
  

/* controls that if double click on desktop items, they open the corresponding window */
(function () {
  const icons = document.querySelectorAll('.desktop-icon');
  const desktop = document.getElementById('desktop');

  // single click: select icon, deselect others
  icons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      icons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  //click empty desktop: deselect all 
  desktop.addEventListener('click', () => {
    icons.forEach(i => i.classList.remove('selected'));
  });

  // double click: open the linked window
  icons.forEach(icon => {
    icon.addEventListener('dblclick', () => {
      const windowId = icon.dataset.window;
      if (windowId && window.WindowControl) {
        window.WindowControl.openWindow(windowId);
      }
    });
  });

  // email list click: show that email's body content
  const emailList = document.getElementById('email-list');
  const emailBody = document.getElementById('email-body');

  if (emailList && emailBody) {
    emailList.addEventListener('click', (e) => {
      const item = e.target.closest('.email-item');
      if (!item) return;

      item.classList.remove('unread');

      // populate and show the body from the item's stored content
      if (item.dataset.body) {
        emailBody.innerHTML = item.dataset.body;
      }
      emailBody.classList.remove('hidden');

      // update badge and title bar with remaining unread count
      const remaining = emailList.querySelectorAll('.email-item.unread').length;
      const emailTitle = document.querySelector('#email-window .title-bar-text');
      if (emailTitle) {
        emailTitle.textContent = 'Baagle Mail — Inbox' + (remaining > 0 ? ' (' + remaining + ')' : '');
      }
      const badge = document.getElementById('email-badge');
      if (badge) {
        if (remaining > 0) {
          badge.textContent = remaining;
        } else {
          badge.classList.add('hidden');
        }
      }
    });
  }
})();