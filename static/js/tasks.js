
console.log("TASKS JS LOADED V10"); //debugging purposes can be deleted after
//start button click? then Baagglebor notification
  const startBtn = document.getElementById('start-button');
const notification = document.getElementById('notification-popup');
const notifClose = notification ? notification.querySelector('.notification-close') : null;

// array of messages — can rotate or escalate later
const startMessages = [
  'Did you need something? Get back to work.',
  'The Start menu has been disabled for productivity reasons.',
  'This action has been logged. Your manager has been notified.',
  'Fun fact: top performers never click Start. Just saying.',
  'Are you looking for something? I can help — if you get back to your tasks first.',
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

/* task system — watches for player actions, reports completion to chatbot */

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
    
    // starts the timer (KEPT IT 30 SECONDS FOR NOW)
    startTimer(30);

    if (task.type === 'delete_files') {
      taskState.deleted = 0;
      taskState.target = task.count || 8;
    }
  }
  
  // function to start the timer
  function startTimer(seconds) {
    console.log("Timer started:", seconds);   // debug
    clearInterval(taskTimer);
    timeRemaining = seconds;
    updateTimerUI();
    taskTimer = setInterval(() => {
      timeRemaining--;
      updateTimerUI();
      console.log("Timer tick:", timeRemaining);  //  for debug
      if (timeRemaining <= 0) {
        clearInterval(taskTimer);
        taskTimer = null;
        taskFailed();
      }

    }, 1000);
  }

  //halting the timer
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

    stopTimer();

    const completed = activeTask;

    activeTask = null;
    taskState = {};

    // notify chatbot
    window.dispatchEvent(new CustomEvent('task-completed', {
      detail: { taskId: completed.id, type: completed.type }
    }));

  }

  function taskFailed() {
  failedTasks++;

  stopTimer();

  const failed = activeTask;

  const timer = document.getElementById("task-timer");
  if (!timer) return;

  timer.style.display = "block";

  
  timer.style.opacity = "0.7";
  timer.style.borderColor = "#999";
  timer.style.color = "#666";

  timer.innerHTML =
    '<div class="timer-header">TASK MISSED</div>' +
    '<div class="timer-time">Looks like you\'re struggling.<br>Ask BaagleBot for help in chat.</div>';

  window.dispatchEvent(new CustomEvent("task-help-available", {
    detail: { task: failed }
  }));
}
  
  function getActiveTask() {
    return activeTask;
  }

  window.TaskSystem = { startTask, getActiveTask, getFailedTasks: () => failedTasks };

})();