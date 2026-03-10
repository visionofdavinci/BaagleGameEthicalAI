/* task system — watches for player actions, reports completion to chatbot */

(function () {
  let activeTask = null;
  let taskState = {};  // tracks progress for multi-step tasks

  // start a task
  function startTask(task) {
    activeTask = task;
    taskState = {};

    if (task.type === 'delete_files') {
      taskState.deleted = 0;
      taskState.target = task.count || 8;
    }
  }

  // listen for file actions from explorer 
  window.addEventListener('file-action', (e) => {
    if (!activeTask) return;

    const detail = e.detail;

    switch (activeTask.type) {
      case 'open_file':
        if (detail.action === 'open_file' && detail.fileId === activeTask.targetId) {
          completeTask();
        }
        break;

      case 'read_confirm':
        if (detail.action === 'read_confirm' && detail.fileId === activeTask.targetId) {
          completeTask();
        }
        break;

      case 'delete_files':
        if (detail.action === 'delete_file') {
          taskState.deleted++;
          if (taskState.deleted >= taskState.target) {
            completeTask();
          }
        }
        break;
    }
  });

  // listen for email replies 
  window.addEventListener('email-replied', (e) => {
    if (!activeTask) return;
    if (activeTask.type === 'reply_email' && e.detail.emailId === activeTask.targetId) {
      completeTask();
    }
  });

  //complete the active task
  function completeTask() {
    const completed = activeTask;
    activeTask = null;
    taskState = {};

    // notify chatbot
    window.dispatchEvent(new CustomEvent('task-completed', {
      detail: { taskId: completed.id, type: completed.type }
    }));
  }

  function getActiveTask() {
    return activeTask;
  }

  window.TaskSystem = { startTask, getActiveTask };
})();