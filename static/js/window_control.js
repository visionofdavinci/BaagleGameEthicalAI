//controls: opening a window, closing a window, minimizing, maximizing, dragging, resizing, z-index management*/
(function () {
  let topZ = 100; //tracks the highest z-index so clicked windows come to front
  // bring a window to front 
  function focusWindow(win) {
    // mark all windows inactive
    document.querySelectorAll('.xp-window').forEach(w => w.classList.add('inactive'));
    // bring this one forward
    win.classList.remove('inactive');
    win.style.zIndex = ++topZ;
  }
  // open a window
  function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = 'block';
    win.classList.remove('minimized');
    focusWindow(win);

    // stagger position so windows don't stack exactly
    const openCount = document.querySelectorAll('.xp-window[style*="display: block"]').length;
    if (!win.dataset.positioned) {
      win.style.top  = (60 + openCount * 30) + 'px';
      win.style.left = (100 + openCount * 30) + 'px';
      win.dataset.positioned = 'true';
    }

    // notify taskbar
    window.dispatchEvent(new CustomEvent('window-opened', { detail: { id } }));
  }

  // close a window
  function closeWindow(win) {
    win.style.display = 'none';
    win.classList.remove('maximized', 'minimized');
    win.dataset.positioned = '';
    window.dispatchEvent(new CustomEvent('window-closed', { detail: { id: win.id } }));
  }

  // minimize a window
  function minimizeWindow(win) {
    win.classList.add('minimized');
    window.dispatchEvent(new CustomEvent('window-minimized', { detail: { id: win.id } }));
  }

  // maximize / restore toggle
  function toggleMaximize(win) {
    win.classList.toggle('maximized');
  }

  // dragging
  function initDrag(win) {
    const titleBar = win.querySelector('.title-bar');
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
      // don't drag if clicking a control button
      if (e.target.closest('.title-bar-controls')) return;
      // don't drag if maximized
      if (win.classList.contains('maximized')) return;

      focusWindow(win);
      win.classList.add('dragging');

      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;

      function onMouseMove(e) {
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top  = (e.clientY - offsetY) + 'px';
      }

      function onMouseUp() {
        win.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // wire up all windows on page load
  function init() {
    document.querySelectorAll('.xp-window').forEach(win => {
      // dragging
      initDrag(win);

      // clicking anywhere on the window brings it to front
      win.addEventListener('mousedown', () => focusWindow(win));

      // control buttons
      const btnClose    = win.querySelector('.btn-close');
      const btnMinimize = win.querySelector('.btn-minimize');
      const btnMaximize = win.querySelector('.btn-maximize');

      if (btnClose)    btnClose.addEventListener('click',    () => closeWindow(win));
      if (btnMinimize) btnMinimize.addEventListener('click', () => minimizeWindow(win));
      if (btnMaximize) btnMaximize.addEventListener('click', () => toggleMaximize(win));
    });
  }

  // expose openWindow globally so desktop.js and taskbar.js can call it
  window.WindowControl = { openWindow, initWindow: function(win) { initDrag(win); } };

  document.addEventListener('DOMContentLoaded', init);
})();