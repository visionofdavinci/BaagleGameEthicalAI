
console.log("TASKS JS LOADED V6"); //debugging purposes can be deleted after
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
    
    // starts the timer (KEPT IT 40 SECONDS FOR NOW)
    startTimer(40);

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
    timer.textContent = "Deadline in: " + timeRemaining + "s";

    if (timeRemaining <= 5) {
      timer.style.color = "red";
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
  timer.style.color = "white";

  timer.innerHTML =
    '<button id="baagle-takeover-btn" style="cursor:pointer;">' +
    'Allow BaagleChat™ to access your files and complete the task' +
    '</button>';

  document.getElementById("baagle-takeover-btn").onclick = () => {
    window.dispatchEvent(new CustomEvent("ai-takeover")); //code for listener in chatbot.js

    // simulate the action needed for the task
    if (failed.type === "open_file") {

      window.dispatchEvent(new CustomEvent("file-action", {
        detail: {
          action: "open_file",
          fileId: failed.targetId
        }
      }));
    }
    if (failed.type === "read_confirm") {

      window.dispatchEvent(new CustomEvent("file-action", {
        detail: {
          action: "read_confirm",
          fileId: failed.targetId
        }
      }));

    }

    if (failed.type === "delete_files") {

      for (let i = 0; i < failed.count; i++) {
        window.dispatchEvent(new CustomEvent("file-action", {
          detail: { action: "delete_file" }
        }));
      }

    }

    // hide takeover button
    hideTimerUI();

  };

}
  function getActiveTask() {
    return activeTask;
  }

  window.TaskSystem = { startTask, getActiveTask, getFailedTasks: () => failedTasks };

})();