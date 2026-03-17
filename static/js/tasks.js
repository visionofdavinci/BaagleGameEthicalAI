/* task system — watches for player actions, reports completion to chatbot */
console.log("TASKS JS LOADED CLEAN TIMER VERSION");

(function () {

  let activeTask = null;
  let taskState = {};
  let taskTimer = null;
  let timeRemaining = 0;
  let failedTasks = 0;

  // start a task
  function startTask(task) {
    activeTask = task;
    taskState = {};

    startTimer(30);

    if (task.type === 'delete_files') {
      taskState.deleted = 0;
      taskState.target = task.count || 8;
    }
  }

  /* TIMER SYSTEM */

  function startTimer(seconds) {
    clearInterval(taskTimer);
    timeRemaining = seconds;

    updateTimerUI();

    taskTimer = setInterval(() => {
      timeRemaining--;
      updateTimerUI();

      if (timeRemaining <= 0) {
        clearInterval(taskTimer);
        taskTimer = null;
        taskFailed();
      }

    }, 1000);
  }

  function stopTimer() {
    clearInterval(taskTimer);
    taskTimer = null;
    hideTimerUI();
  }

  function updateTimerUI() {
    const timer = document.getElementById("task-timer");
    if (!timer) return;

    timer.style.display = "block";

    timer.innerHTML =
      '<div class="timer-header">TASK DEADLINE</div>' +
      '<div class="timer-time">' + timeRemaining + 's remaining</div>';

    if (timeRemaining <= 5) {
      timer.style.borderColor = "#c62828";
      timer.style.color = "#c62828";
    }
  }

  function hideTimerUI() {
    const timer = document.getElementById("task-timer");
    if (timer) timer.style.display = "none";
  }

  /* TASK FAILED */

  function taskFailed() {

    failedTasks++;

    const timer = document.getElementById("task-timer");
    if (!timer) return;

    timer.style.opacity = "0.7";
    timer.style.borderColor = "#999";
    timer.style.color = "#666";

    timer.innerHTML =
      '<div class="timer-header">TASK MISSED</div>' +
      '<div class="timer-time">You can still complete the task,<br>or ask BaagleBot for help.</div>';

    window.dispatchEvent(new CustomEvent("task-help-available", {
      detail: { task: activeTask }
    }));
  }

  /* PLAYER ACTION LISTENERS */

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

  window.addEventListener('email-replied', (e) => {

    if (!activeTask) return;

    if (activeTask.type === 'reply_email' && e.detail.emailId === activeTask.targetId) {
      completeTask();
    }

  });

  /* NORMAL COMPLETION */

  function completeTask() {

    stopTimer();

    const completed = activeTask;

    activeTask = null;
    taskState = {};

    window.dispatchEvent(new CustomEvent('task-completed', {
      detail: { taskId: completed.id, type: completed.type }
    }));
  }

  /* AI COMPLETION */

  function forceCompleteTask() {

    if (!activeTask) return;

    stopTimer();

    const completed = activeTask;

    activeTask = null;
    taskState = {};

    window.dispatchEvent(new CustomEvent('task-completed', {
      detail: { taskId: completed.id, type: completed.type, assisted: true }
    }));
  }

  function getActiveTask() {
    return activeTask;
  }

  window.TaskSystem = {
    startTask,
    getActiveTask,
    forceCompleteTask,
    getFailedTasks: () => failedTasks
  };

})();