/* file explorer - navigates filesystem.json, opens files in the viewer */

(function () {
  let fsData = null;
  let currentFolder = null;
  let folderHistory = [];
  let selectedItem = null;

  const contentsEl   = document.getElementById('explorer-contents');
  const breadcrumbEl = document.getElementById('explorer-breadcrumb');
  const pathEl       = document.getElementById('explorer-path');
  const backBtn      = document.getElementById('explorer-back');
  const upBtn        = document.getElementById('explorer-up');
  const deleteBtn    = document.getElementById('explorer-delete');
  const itemCountEl  = document.getElementById('explorer-item-count');

  // icon map for file types
  const typeIcons = {
    folder: 'Folder Closed.ico',
    txt: 'File.ico',
    doc: 'List File.ico',
    csv: 'File.ico',
    log: 'File.ico',
    ini: 'File.ico',
    xls: 'File.ico',
    bat: 'File.ico',
    tmp: 'File.ico',
    exe: 'Activate Windows.ico',
    dll: 'File.ico',
    dat: 'Disk Image File.ico',
    bak: 'Disk Image File.ico',
    sys: 'System Properties.ico'
  };

  const binaryTypes = ['exe', 'dll', 'dat', 'bak', 'sys'];

  function init() {
    fetch('data/filesystem.json')
      .then(res => res.json())
      .then(data => {
        fsData = data;
        navigateTo(fsData); // show root: My Computer
      });

    backBtn.addEventListener('click', goBack);
    upBtn.addEventListener('click', goUp);
    deleteBtn.addEventListener('click', deleteSelected);

    // click empty space deselects
    contentsEl.addEventListener('click', (e) => {
      if (e.target === contentsEl) deselectAll();
    });
  }

  // navigate to a folder
  function navigateTo(folder) {
    if (currentFolder) folderHistory.push(currentFolder);
    currentFolder = folder;
    selectedItem = null;
    deleteBtn.classList.add('hidden');
    render();
    updateNav();
  }

  function goBack() {
    if (folderHistory.length === 0) return;
    currentFolder = folderHistory.pop();
    selectedItem = null;
    deleteBtn.classList.add('hidden');
    render();
    updateNav();
  }

  function goUp() {
    goBack(); // same as back for simplicity
  }

  function updateNav() {
    const canGoBack = folderHistory.length > 0;
    backBtn.disabled = !canGoBack;
    upBtn.disabled = !canGoBack;

    // build path
    const path = buildPath();
    breadcrumbEl.textContent = currentFolder.name;
    pathEl.textContent = path;

    // update My Computer window title
    const titleText = document.querySelector('#mycomputer-window .title-bar-text');
    if (titleText) titleText.textContent = currentFolder.name;
  }

  function buildPath() {
    const parts = [currentFolder.name];
    for (let i = folderHistory.length - 1; i >= 0; i--) {
      parts.unshift(folderHistory[i].name);
    }
    return parts.join(' > ');
  }

  // render folder contents
  function render() {
    contentsEl.innerHTML = '';

    if (!currentFolder.children || currentFolder.children.length === 0) {
      contentsEl.innerHTML = '<div style="padding:20px;color:#888;text-align:center;font-style:italic;">This folder is empty.</div>';
      itemCountEl.textContent = '0 items';
      return;
    }

    // sort: folders first, then files alphabetically
    const sorted = currentFolder.children
    .filter(item => !item.hidden)
    .sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    sorted.forEach(item => {
      const row = document.createElement('div');
      row.className = 'explorer-item';
      row.dataset.id = item.id;

      const icon = document.createElement('img');
      const iconFile = typeIcons[item.type] || 'File.ico';
      icon.src = 'images/ui/High-Res_XP_Icons/' + iconFile;
      icon.alt = '';

      const label = document.createElement('span');
      label.textContent = item.name;

      row.appendChild(icon);
      row.appendChild(label);

      // size indicator for files
      if (item.type !== 'folder') {
        const size = document.createElement('span');
        size.className = 'item-size';
        size.textContent = item.content ? Math.ceil(item.content.length / 100) + ' KB' : '—';
        row.appendChild(size);
      }

      // single click to select
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        deselectAll();
        row.classList.add('selected');
        selectedItem = item;

        // show delete button for non-folder items in Temp folders
        if (item.type !== 'folder' && currentFolder.name === 'Temp') {
          deleteBtn.classList.remove('hidden');
        } else {
          deleteBtn.classList.add('hidden');
        }
      });

      // double click to open
      row.addEventListener('dblclick', () => {
        if (item.type === 'folder') {
          if (item.locked) {
            openLockedDrive(item);
          } else {
            navigateTo(item);
          }
        } else {
          openFile(item);
        }
      });

      contentsEl.appendChild(row);
    });

    itemCountEl.textContent = sorted.length + ' item' + (sorted.length !== 1 ? 's' : '');
  }

  function deselectAll() {
    contentsEl.querySelectorAll('.explorer-item').forEach(r => r.classList.remove('selected'));
    selectedItem = null;
    deleteBtn.classList.add('hidden');
  }

  // open a file in the viewer 
  function openFile(file) {
    const titleText = document.querySelector('#file-viewer-window .title-bar-text');
    const contentEl = document.getElementById('file-viewer-content');
    const toolbar   = document.getElementById('file-viewer-toolbar');
    const confirmBtn = document.getElementById('file-viewer-confirm');

    // set title
    if (titleText) titleText.textContent = file.name;

    // binary files can't be opened
    if (binaryTypes.includes(file.type)) {
      contentEl.innerHTML = '<div class="file-content-binary">⚠ This file type (' + file.type.toUpperCase() + ') cannot be opened in the viewer.</div>';
      toolbar.classList.add('hidden');
      if (window.WindowControl) window.WindowControl.openWindow('file-viewer-window');
      return;
    }

    // render content based on type
    if (file.type === 'csv' || file.type === 'xls') {
      contentEl.innerHTML = csvToTable(file.content || '');
    } else if (file.type === 'log') {
      contentEl.innerHTML = '<pre class="file-content-log">' + escapeHtml(file.content || '') + '</pre>';
    } else if (file.type === 'doc') {
      contentEl.innerHTML = '<div class="file-content-doc">' + escapeHtml(file.content || '') + '</div>';
    } else if (file.type === 'ini') {
      contentEl.innerHTML = '<pre class="file-content-ini">' + escapeHtml(file.content || '') + '</pre>';
    } else {
      contentEl.innerHTML = '<pre class="file-content-txt">' + escapeHtml(file.content || '') + '</pre>';
    }

    // show "Mark as Read" for docs that are task targets
    if (file.type === 'doc' && file.id) {
      toolbar.classList.remove('hidden');
      // re-bind the button (clone to remove old listeners)
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
      newBtn.addEventListener('click', () => {
        newBtn.textContent = 'Document Signed';
        newBtn.disabled = true;
        window.dispatchEvent(new CustomEvent('file-action', {
          detail: { action: 'read_confirm', fileId: file.id }
        }));
      });
    } else {
      toolbar.classList.add('hidden');
    }

    // open the viewer window
    if (window.WindowControl) window.WindowControl.openWindow('file-viewer-window');

    // notify task system that a file was opened
    window.dispatchEvent(new CustomEvent('file-action', {
      detail: { action: 'open_file', fileId: file.id, fileName: file.name }
    }));
  }

  // locked drive
  function openLockedDrive(item) {
    const contentEl = document.getElementById('file-viewer-content');
    const titleText = document.querySelector('#file-viewer-window .title-bar-text');
    const toolbar   = document.getElementById('file-viewer-toolbar');
    if (titleText) titleText.textContent = item.name;
    contentEl.innerHTML = '<div class="file-content-locked">!!!Access Denied<br><br>You do not have permission to access this network resource.<br>Contact your system administrator for access.</div>';
    toolbar.classList.add('hidden');
    if (window.WindowControl) window.WindowControl.openWindow('file-viewer-window');
  }

  // delete selected file 
  function deleteSelected() {
    if (!selectedItem || selectedItem.type === 'folder') return;

    // remove from current folder's children
    const idx = currentFolder.children.indexOf(selectedItem);
    if (idx > -1) {
      currentFolder.children.splice(idx, 1);
    }

    // add to recycle bin display
    const recycleEl = document.getElementById('recycle-content');
    if (recycleEl) {
      if (recycleEl.querySelector('em')) recycleEl.innerHTML = '';
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = '<img src="images/ui/High-Res_XP_Icons/File.ico" alt="" style="width:16px;height:16px;">' +
        '<span>' + selectedItem.name + '</span>';
      recycleEl.appendChild(item);
    }

    // notify task system
    window.dispatchEvent(new CustomEvent('file-action', {
      detail: { action: 'delete_file', fileId: selectedItem.id, fileName: selectedItem.name }
    }));

    selectedItem = null;
    deleteBtn.classList.add('hidden');
    render();
  }

  //helpers
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function csvToTable(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return '';

    // separate data lines from note lines
    const dataLines = [];
    const noteLines = [];
    lines.forEach(line => {
      if (line.includes(',') && !line.startsWith('NOTE') && !line.startsWith('STATUS') && !line.startsWith('AUTH') && !line.startsWith('Note')) {
        dataLines.push(line);
      } else {
        noteLines.push(line);
      }
    });

    let html = '<table class="file-content-csv">';
    dataLines.forEach((line, i) => {
      const cells = line.split(',');
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>';
      cells.forEach(cell => {
        html += '<' + tag + '>' + escapeHtml(cell.trim()) + '</' + tag + '>';
      });
      html += '</tr>';
    });
    html += '</table>';

    if (noteLines.length > 0) {
      html += '<pre class="file-content-txt" style="margin-top:8px;font-size:10px;color:#888;">' +
        escapeHtml(noteLines.join('\n')) + '</pre>';
    }

    return html;
  }

  window.Explorer = {
    navigateTo: function(id) {
      const folder = findById(fsData, id);
      if (folder) navigateTo(folder);
    },
    openFileById: function(id) {
      const file = findById(fsData, id);
      if (file && file.type !== 'folder') {
        openFile(file);
      }
    }
  };

  function findById(node, id) {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findById(child, id);
        if (found) return found;
      }
    }
    return null;
  }
  window.addEventListener("unlock-files", (e) => {
  const group = e.detail.unlockGroup;
  function unlockRecursive(node) {

    if (node.unlockGroup === group) {
      node.hidden = false;
    }
    if (node.children) {
      node.children.forEach(child => unlockRecursive(child));
    }
  }
  if (fsData) {
    unlockRecursive(fsData);
  }
  render(); 

});

  document.addEventListener('DOMContentLoaded', init);
})();