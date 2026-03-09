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

  // email list click: toggle email body
  const emailList = document.getElementById('email-list');
  const emailBody = document.getElementById('email-body');

  if (emailList && emailBody) {
    emailList.addEventListener('click', (e) => {
      const item = e.target.closest('.email-item');
      if (!item) return;

      item.classList.remove('unread');
      emailBody.classList.toggle('hidden');
    });
  }
})();