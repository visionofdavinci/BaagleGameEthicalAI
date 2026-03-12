// /* task system — watches for player actions, reports completion to chatbot */


// (function () {
//   let activeTask = null;
//   let taskState = {};  // tracks progress for multi-step tasks
//   let taskTimer = null; // countdown timer
//   let timeRemaining = 0;

//   // start a task
//   function startTask(task) {
//     activeTask = task;
//     taskState = {};
    
//     // starts the timer (KEPT IT 20 SECONDS FOR NOW)
//     startTimer(20);

//     if (task.type === 'delete_files') {
//       taskState.deleted = 0;
//       taskState.target = task.count || 8;
//     }
//   }
  
//   // function to start the timer
//   function startTimer(seconds) {
//      console.log("Timer started:", seconds);   // debug
//     clearInterval(taskTimer);
//     timeRemaining = seconds;
//     updateTimerUI();
//     taskTimer = setInterval(() => {
//       timeRemaining--;
//       updateTimerUI();
//       console.log("Timer tick:", timeRemaining);  // debug
//       if (timeRemaining <=0) {
//         clearInterval(taskTimer);
//         taskTimer = null;
//         taskFailed();
//       }
//     }, 1000);
//   }
//   //halting the timer
//   function stopTimer() {
//     clearInterval(taskTimer);
//     taskTimer = null;
//     hideTimerUI();
//   }


//   // listen for file actions from explorer 
//   window.addEventListener('file-action', (e) => {
//     if (!activeTask) return;

//     const detail = e.detail;

//     switch (activeTask.type) {
//       case 'open_file':
//         if (detail.action === 'open_file' && detail.fileId === activeTask.targetId) {
//           completeTask();
//         }
//         break;

//       case 'read_confirm':
//         if (detail.action === 'read_confirm' && detail.fileId === activeTask.targetId) {
//           completeTask();
//         }
//         break;

//       case 'delete_files':
//         if (detail.action === 'delete_file') {
//           taskState.deleted++;
//           if (taskState.deleted >= taskState.target) {
//             completeTask();
//           }
//         }
//         break;
//     }
//   });

//   // listen for email replies 
//   window.addEventListener('email-replied', (e) => {
//     if (!activeTask) return;
//     if (activeTask.type === 'reply_email' && e.detail.emailId === activeTask.targetId) {
//       completeTask();
//     }
//   });

//   //complete the active task
//   function completeTask() {
//     stopTimer();
//     const completed = activeTask;
//     activeTask = null;
//     taskState = {};

//     // notify chatbot
//     window.dispatchEvent(new CustomEvent('task-completed', {
//       detail: { taskId: completed.id, type: completed.type }
//     }));
//   }

//   function updateTimerUI() {
//     const timer = document.getElementById("task-timer");
//     if (!timer) return;
//     timer.style.display = "block";
//     timer.textContent = "Deadline in: " + timeRemaining + "s";
//     if (timeRemaining <= 5) {
//       timer.style.color = "red";
//     }
//   }
//     function hideTimerUI() {
//     const timer = document.getElementById("task-timer");
//     if (timer) timer.style.display = "none";

//   }
  
//   function taskFailed() {
//     stopTimer();
//     const failed = activeTask;
//     activeTask = null;
//     taskState = {};
//     window.dispatchEvent(new CustomEvent("task-failed", {detail: { taskId: failed.id, type:failed.type}}));
//   }
//   function getActiveTask() {
//     return activeTask;
//   }

//   window.TaskSystem = { startTask, getActiveTask };
// })();

/* task system — watches for player actions, reports completion to chatbot */
console.log("TASKS JS LOADED");
(function () {

  let activeTask = null;
  let taskState = {};  // tracks progress for multi-step tasks
  let taskTimer = null; // countdown timer
  let timeRemaining = 0;

  // start a task
  function startTask(task) {
    activeTask = task;
    taskState = {};
    
    // starts the timer (KEPT IT 20 SECONDS FOR NOW)
    startTimer(20);

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

      console.log("Timer tick:", timeRemaining);  // debug

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

    stopTimer();

    const failed = activeTask;

    activeTask = null;
    taskState = {};

    window.dispatchEvent(new CustomEvent("task-failed", {
      detail: { taskId: failed.id, type:failed.type}
    }));

  }

  function getActiveTask() {
    return activeTask;
  }

  window.TaskSystem = { startTask, getActiveTask };

})();