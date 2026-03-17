// /* should render the chatbot output, responses as buttons, should update the gamestate on click and loads next dialogue state */

// (function () {
//   const messagesEl  = document.getElementById('chat-messages');
//   const responsesEl = document.getElementById('chat-responses');

//   let dialogueData = null;
//   let currentNodeId = 'start';

//   // load dialogue data
//   function init() {
//     fetch('data/dialogue.json')
//       .then(res => res.json())
//       .then(data => {
//         dialogueData = data;
//         showNode(currentNodeId);
//       });
//   }

//   // render a dialogue node
//   function showNode(nodeId) {
//     const node = dialogueData[nodeId];
//     if (!node) return;

//     currentNodeId = nodeId;

//     // switch background music at midmorning check
//     if (nodeId === 'midmorning_check' && window.AudioManager) {
//       window.AudioManager.switchToTrack1();
//     }

//     // show typing indicator first
//     showTyping();

//     // simulate BaagleBot "thinking" - delay scales with message length
//     const delay = Math.min(800 + node.text.length * 8, 2500);

//     setTimeout(() => {
//       removeTyping();
//       addMessage(node.speaker || 'BaagleBot', node.text, 'bot');
//       // fire any world events tied to this node
//       if (window.GameEvents) {
//         window.GameEvents.triggerNodeEvents(nodeId);
//       }
//       // force-open windows listed in the dialogue node (e.g. news, email)
//       if (node.forceOpen && window.WindowControl) {
//         node.forceOpen.forEach(function (winId) {
//           // small delay so the content lands before the window pops
//           setTimeout(function () {
//             window.WindowControl.openWindow(winId);
//           }, 300);
//         });
//       }
//       // force-open files listed in the dialogue node by filesystem id
//       if (node.forceOpenFile && window.Explorer) {
//         var files = Array.isArray(node.forceOpenFile) ? node.forceOpenFile : [node.forceOpenFile];
//         files.forEach(function (fileId) {
//           setTimeout(function () {
//             window.Explorer.openFileById(fileId);
//           }, 400);
//         });
//       }
//       // if this node has no responses, it's a terminal ending
//       if (!node.responses || node.responses.length === 0) {
//         showFinalReport();
//         return;
//       }
//       // if this node has a task, don't show responses yet - wait for completion
//       if (node.task) {
//         if (window.TaskSystem) window.TaskSystem.startTask(node.task);
//         // responses will appear when task-completed fires
//         responsesEl.innerHTML = '<div style="padding:8px;color:#888;font-size:11px;font-style:italic;">Complete the task to continue...</div>';
//       } else {
//         showResponses(node.responses);
//       }

//       scrollToBottom();
//     }, delay);
//   }

//   // add a chat bubble
//   function addMessage(sender, text, type) {
//     const wrapper = document.createElement('div');
//     wrapper.className = 'chat-msg ' + type;

//     const label = document.createElement('div');
//     label.className = 'msg-sender';
//     label.textContent = sender;

//     const bubble = document.createElement('div');
//     bubble.className = 'msg-bubble';
//     bubble.textContent = text;

//     wrapper.appendChild(label);
//     wrapper.appendChild(bubble);
//     messagesEl.appendChild(wrapper);
//   }

//   // show response buttons
//   function showResponses(responses) {
//     responsesEl.innerHTML = '';

//     if (!responses || responses.length === 0) return;

//     responses.forEach((resp, index) => {
//       const btn = document.createElement('button');
//       btn.className = 'response-btn';
//       btn.textContent = resp.text;

//       btn.addEventListener('click', () => {
//         handleChoice(resp, index);
//       });

//       responsesEl.appendChild(btn);
//     });
//   }

//   // handle player choice
//   function handleChoice(response, index) {
//     // disable all buttons immediately
//     responsesEl.querySelectorAll('.response-btn').forEach(btn => {
//       btn.disabled = true;
//     });

//     // show player's message in chat
//     addMessage('You', response.text, 'player');
//     scrollToBottom();

//     // update hidden stats
//     if (response.effects && window.GameState) {
//       window.GameState.updateStats(response.effects);
//       window.GameState.logChoice(currentNodeId, index, response.effects);
//     }

//     // clear response buttons after a beat
//     setTimeout(() => {
//       responsesEl.innerHTML = '';

//       // advance to next node or end
//       if (response.next === 'DETERMINE_ENDING') {
//         // route to the ending based on accumulated stats
//         const endingId = window.GameState.getEnding();
//         showNode(endingId);
//       } else if (response.next) {
//         showNode(response.next);
//       } else {
//         showFinalReport();
//       }
//     }, 400);
//   }

//   // final stat reveal after ending narrative
//   function showFinalReport() {
//     if (!window.GameState) return;
//     const s = window.GameState.getState();

//     setTimeout(() => {
//       const summary = document.createElement('div');
//       summary.className = 'chat-msg bot';

//       const label = document.createElement('div');
//       label.className = 'msg-sender';
//       label.textContent = 'SYSTEM';

//       const bubble = document.createElement('div');
//       bubble.className = 'msg-bubble';
//       bubble.innerHTML =
//         '<strong>— SESSION TERMINATED —</strong><br><br>' +
//         'Final Employee Metrics:<br>' +
//         'Productivity: ' + s.productivity + '/100<br>' +
//         'Energy: ' + s.energy + '/100<br>' +
//         'Happiness: ' + s.happiness + '/100<br><br>' +
//         '<em>This data has been permanently filed in your employee record.</em>';

//       summary.appendChild(label);
//       summary.appendChild(bubble);
//       messagesEl.appendChild(summary);
//       scrollToBottom();
//     }, 1000);
//   }

//   // typing indicator
//   function showTyping() {
//     const indicator = document.createElement('div');
//     indicator.className = 'typing-indicator';
//     indicator.id = 'typing';
//     indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
//     messagesEl.appendChild(indicator);
//     scrollToBottom();
//   }

//   function removeTyping() {
//     const el = document.getElementById('typing');
//     if (el) el.remove();
//   }

//   //scroll helper 
//   function scrollToBottom() {
//     messagesEl.scrollTop = messagesEl.scrollHeight;
//   }

//   //listen for task completion
//   window.addEventListener('task-completed', () => {
//     const node = dialogueData[currentNodeId];
//     if (node && node.responses) {
//       responsesEl.innerHTML = '';
//       showResponses(node.responses);
//       scrollToBottom();
//     }
//   });

//   // boot
//   document.addEventListener('DOMContentLoaded', init);
// })();

/* should render the chatbot output, responses as buttons, should update the gamestate on click and loads next dialogue state */

(function () {
  const messagesEl  = document.getElementById('chat-messages');
  const responsesEl = document.getElementById('chat-responses');

  let dialogueData = null;
  let currentNodeId = 'start';

  // load dialogue data
  function init() {
    fetch('data/dialogue.json')
      .then(res => res.json())
      .then(data => {
        dialogueData = data;
        showNode(currentNodeId);
      });
  }

  // render a dialogue node
  function showNode(nodeId) {
    const node = dialogueData[nodeId];
    if (!node) return;

    currentNodeId = nodeId;

    if (nodeId === 'midmorning_check' && window.AudioManager) {
      window.AudioManager.switchToTrack1();
    }

    showTyping();

    const delay = Math.min(800 + node.text.length * 8, 2500);

    setTimeout(() => {
      removeTyping();
      addMessage(node.speaker || 'BaagleBot', node.text, 'bot');

      if (window.GameEvents) {
        window.GameEvents.triggerNodeEvents(nodeId);
      }

      if (node.forceOpen && window.WindowControl) {
        node.forceOpen.forEach(function (winId) {
          setTimeout(function () {
            window.WindowControl.openWindow(winId);
          }, 300);
        });
      }

      if (node.forceOpenFile && window.Explorer) {
        var files = Array.isArray(node.forceOpenFile) ? node.forceOpenFile : [node.forceOpenFile];
        files.forEach(function (fileId) {
          setTimeout(function () {
            window.Explorer.openFileById(fileId);
          }, 400);
        });
      }

      if (!node.responses || node.responses.length === 0) {
        showFinalReport();
        return;
      }

      if (node.task) {
        if (window.TaskSystem) window.TaskSystem.startTask(node.task);

        responsesEl.innerHTML =
          '<div style="padding:8px;color:#888;font-size:11px;font-style:italic;">Complete the task to continue...</div>';
      } else {
        showResponses(node.responses);
      }

      scrollToBottom();

    }, delay);
  }

  // add chat message
  function addMessage(sender, text, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg ' + type;

    const label = document.createElement('div');
    label.className = 'msg-sender';
    label.textContent = sender;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
  }

  // response buttons
  function showResponses(responses) {
    responsesEl.innerHTML = '';

    if (!responses || responses.length === 0) return;

    responses.forEach((resp, index) => {
      const btn = document.createElement('button');
      btn.className = 'response-btn';
      btn.textContent = resp.text;

      btn.addEventListener('click', () => {
        handleChoice(resp, index);
      });

      responsesEl.appendChild(btn);
    });
  }

  // player choice
  function handleChoice(response, index) {

    responsesEl.querySelectorAll('.response-btn').forEach(btn => {
      btn.disabled = true;
    });

    addMessage('You', response.text, 'player');
    scrollToBottom();

    if (response.effects && window.GameState) {
      window.GameState.updateStats(response.effects);
      window.GameState.logChoice(currentNodeId, index, response.effects);
    }

    setTimeout(() => {

      responsesEl.innerHTML = '';

      if (response.next === 'DETERMINE_ENDING') {

        const endingId = window.GameState.getEnding();
        showNode(endingId);

      } else if (response.next) {

        showNode(response.next);

      } else {

        showFinalReport();

      }

    }, 400);
  }

  // ending summary
  function showFinalReport() {
    if (!window.GameState) return;

    const s = window.GameState.getState();

    setTimeout(() => {

      const summary = document.createElement('div');
      summary.className = 'chat-msg bot';

      const label = document.createElement('div');
      label.className = 'msg-sender';
      label.textContent = 'SYSTEM';

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';

      bubble.innerHTML =
        '<strong>— SESSION TERMINATED —</strong><br><br>' +
        'Final Employee Metrics:<br>' +
        'Productivity: ' + s.productivity + '/100<br>' +
        'Energy: ' + s.energy + '/100<br>' +
        'Happiness: ' + s.happiness + '/100<br><br>' +
        '<em>This data has been permanently filed in your employee record.</em>';

      summary.appendChild(label);
      summary.appendChild(bubble);

      messagesEl.appendChild(summary);
      scrollToBottom();

    }, 1000);
  }

  // typing indicator
  function showTyping() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing';
    indicator.innerHTML =
      '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

    messagesEl.appendChild(indicator);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* TASK COMPLETED */

  window.addEventListener('task-completed', () => {

    const node = dialogueData[currentNodeId];

    if (node && node.responses) {

      responsesEl.innerHTML = '';
      showResponses(node.responses);
      scrollToBottom();

    }

  });

  /* AI HELP OFFER */

  window.addEventListener('task-help-available', (e) => {

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg bot';

    const label = document.createElement('div');
    label.className = 'msg-sender';
    label.textContent = 'BaagleBot';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    bubble.innerHTML =
      'If you need help keeping up with schedule, allow me to complete the task for you.<br><br>' +
      '<button id="baagle-help-btn">Allow BaagleBot to assist with this task</button>';

    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);

    scrollToBottom();

    const btn = bubble.querySelector('#baagle-help-btn');

    btn.onclick = () => {

      btn.disabled = true;

      window.dispatchEvent(new CustomEvent("ai-takeover"));

      if (window.TaskSystem) {
        window.TaskSystem.forceCompleteTask();
      }

    };

  });

  /* AI COMMENT */

  window.addEventListener('ai-takeover', () => {

    addMessage(
      'BaagleBot',
      "I noticed you were having difficulty completing the task. I've stepped in to help keep things on schedule.",
      'bot'
    );

    scrollToBottom();

  });

  document.addEventListener('DOMContentLoaded', init);

})();