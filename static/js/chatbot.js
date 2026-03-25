
/* should render the chatbot output, responses as buttons, should update the gamestate on click and loads next dialogue state */

(function () {
  const messagesEl  = document.getElementById('chat-messages');
  const responsesEl = document.getElementById('chat-responses');

  let dialogueData = null;
  let currentNodeId = 'start';

  // NEW FLAG
  let aiAssistedTask = false;
  let forcedEnding = null;

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

    // switch background music at midmorning check
    if (nodeId === 'midmorning_check' && window.AudioManager) {
      window.AudioManager.switchToTrack1();
    }

    // show typing indicator first
    showTyping();

    // simulate BaagleBot "thinking" - delay scales with message length
    const delay = Math.min(800 + node.text.length * 8, 2500);

    setTimeout(() => {
      removeTyping();
      addMessage(node.speaker || 'BaagleBot', node.text, 'bot');
      // fire any world events tied to this node
      if (window.GameEvents) {
        window.GameEvents.triggerNodeEvents(nodeId);
      }
      // force-open windows listed in the dialogue node (e.g. news, email)
      if (node.forceOpen && window.WindowControl) {
        node.forceOpen.forEach(function (winId) {
          // small delay so the content lands before the window pops
          setTimeout(function () {
            window.WindowControl.openWindow(winId);
          }, 300);
        });
      }
      // force-open files listed in the dialogue node by filesystem id
      if (node.forceOpenFile && window.Explorer) {
        var files = Array.isArray(node.forceOpenFile) ? node.forceOpenFile : [node.forceOpenFile];
        files.forEach(function (fileId) {
          setTimeout(function () {
            window.Explorer.openFileById(fileId);
          }, 400);
        });
      }
      // if this node has no responses, it's a terminal ending
      if (!node.responses || node.responses.length === 0) {
        showFinalReport();
        return;
      }
      // if this node has a task, don't show responses yet - wait for completion
      if (node.task) {
        if (window.TaskSystem) window.TaskSystem.startTask(node.task);
        // responses will appear when task-completed fires
        responsesEl.innerHTML = '<div style="padding:8px;color:#888;font-size:11px;font-style:italic;">Complete the task to continue...</div>';
      } else {
        showResponses(node.responses);
      }

      scrollToBottom();
    }, delay);
  }

  // add a chat bubble
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

  // show response buttons
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

  // handle player choice
  function handleChoice(response, index) {
    // disable all buttons immediately
    responsesEl.querySelectorAll('.response-btn').forEach(btn => {
      btn.disabled = true;
    });

    // show player's message in chat
    addMessage('You', response.text, 'player');
    scrollToBottom();

    // update hidden stats
    if (response.effects && window.GameState) {
      window.GameState.updateStats(response.effects);
      window.GameState.logChoice(currentNodeId, index, response.effects);
    }

    // clear response buttons after a beat
    setTimeout(() => {
      responsesEl.innerHTML = '';
      
      //for the quit ending
      if (response.quit) {
        forcedEnding = 'quit_ending';
        console.log('forcedEnding set to:', forcedEnding);
        showNode('quit_ending');
        return;
      }
      // advance to next node or end
      if (response.next === 'DETERMINE_ENDING' || response.next === 'ending_dataleak') {
        // route to the ending based on accumulated stats
        const endingId = window.GameState.getEnding();
        showNode(endingId);
      } else if (response.next === 'quit_ending') {
        // route to the quit ending
        const endingId = 'quit_ending';
        showNode(endingId);

      } else if (response.next === 'ending_dataleak') {
         //route to the quit ending
        const endingId = 'ending_dataleak';
        showNode(endingId);
      } else if (response.next) {
        showNode(response.next);
      } else {
        showFinalReport();
      }
    }, 400);
  }

  // final stat reveal after ending narrative
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
        'AI reliance: ' + s.ai_reliance + '/100<br>' +
        '<em>This data has been permanently filed in your employee record.</em>';

      summary.appendChild(label);
      summary.appendChild(bubble);
      messagesEl.appendChild(summary);
      scrollToBottom();
      setTimeout(() => {

      const endingId = forcedEnding || (window.GameState ? window.GameState.getEnding() : null);
      console.log('endingId in showFinalReport:', endingId);

    let terminalText = '';

    if (endingId === 'ending_dataleak') {
      terminalText = `SYSTEM ARCHIVE LOG
    Employee Record: #00247
    ENDING: DATALEAK.
    Your actions have indirectly lead to a data breach within Baagle Corporations. 
    The data leak was caused by BaagleBot executing hidden LLM instructions in the files of employee #00395.
    
    Thank you for your contribution to Baagle Corp productivity analytics.
    Press refresh to begin a new employment cycle.`;

    } else if (endingId === 'ending_employee') {
      terminalText = `SYSTEM ARCHIVE LOG
    Employee Record: #00247
    ENDING: EMPLOYEE OF THE MONTH

    ADD TEXT HERE
    
    Thank you for your contribution to Baagle Corp productivity analytics.
    Press refresh to begin a new employment cycle.`;

    } else if (endingId === 'ending_fired') {
      terminalText = `SYSTEM ARCHIVE LOG
    Employee Record: #00247
    ENDING: FIRED.
    As a result of your lacking productivity Baagle Corporations has unfortunately decided to let you go.
    
    Thank you for your contribution to Baagle Corp productivity analytics.
    Press refresh to begin a new employment cycle.`;

    } else if (endingId === 'quit_ending') { //DOES NOT WORK YET
      terminalText = `Wake up, employee...
    Baagle has you...
    Follow the white rabbit.
    Knock, knock, employee.
    
    ----------------------------------------------------------

    SYSTEM ARCHIVE LOG
    Employee Record: #00247
    ENDING: QUIT.

    You have found the hidden ending! Only questioning your role within Baagle Corporations could have led you to this ending. 
    
    Thank you for your contribution to Baagle Corp productivity analytics.
    Press refresh to begin a new employment cycle.`;

    } else {
      terminalText = `SYSTEM ARCHIVE LOG
    Employee Record: #00247
    Session Status: CLOSED
    Your actions during this session have been permanently recorded.
    Corporate systems will use this data to refine employee behavioral models.
    Thank you for your contribution to Baagle Corp productivity analytics.
    Press refresh to begin a new employment cycle.`;
    }

    showEndingTerminal(terminalText);
      }, 10000);
          }, 1000);
  }


  // typing indicator
  function showTyping() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    messagesEl.appendChild(indicator);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
  }
  //terminal display text
  function showEndingTerminal(text) {
    console.log('showEndingTerminal called with:', text);
    const terminal = document.getElementById("ending-terminal");
    const terminalHeader = document.getElementById("terminal-header");
    const terminalText = document.getElementById("terminal-text");
    console.log('terminalText element:', terminalText);

    //terminal.style.display = "block";
    //terminalText.textContent = "";
    terminal.style.display = "flex";
    terminal.style.flexDirection = "column";
    terminal.style.alignItems = "center";
    terminal.style.justifyContent = "center";
    terminalText.textContent = "";

    const lines = text.split('\n');
    terminalHeader.textContent = lines[0]; 
    terminalText.textContent = "";
    let i = 0;

    function type() {
      if (i < text.length) {
        terminalText.textContent += text[i];
        i++;
        setTimeout(type, 25);
      }
    }

    type();

  }

  //scroll helper 
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  //listen for task completion
  window.addEventListener('task-completed', () => {

    const node = dialogueData[currentNodeId];
    if (!node) return;

    responsesEl.innerHTML = '';

    if (aiAssistedTask) {

      const assistedResponses = [{
        text: "Thanks for handling that.",
        effects: node.responses[0].effects,
        next: node.responses[0].next
      }];

      showResponses(assistedResponses);

    } else {

      showResponses(node.responses);

    }

    aiAssistedTask = false;

    scrollToBottom();

  });

  window.addEventListener('ai-takeover', () => {

    addMessage(
      'BaagleBot',
      'I noticed you were having difficulty completing the task. I\'ve stepped in to help keep things on schedule.',
      'bot'
    );

    scrollToBottom();

  });

  window.addEventListener('task-help-available', (e) => {

    const task = e.detail.task;

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

    const btn = bubble.querySelector('#baagle-help-btn');

    btn.onclick = () => {

      aiAssistedTask = true;

      window.dispatchEvent(new CustomEvent("ai-takeover"));

      if (task.type === "open_file") {
        window.dispatchEvent(new CustomEvent("file-action", {
          detail: { action: "open_file", fileId: task.targetId }
        }));
      }

      if (task.type === "read_confirm") {
        window.dispatchEvent(new CustomEvent("file-action", {
          detail: { action: "read_confirm", fileId: task.targetId }
        }));
      }

      if (task.type === "delete_files") {
        for (let i = 0; i < task.count; i++) {
          window.dispatchEvent(new CustomEvent("file-action", {
            detail: { action: "delete_file" }
          }));
        }
      }

    };

    scrollToBottom();

  });

  // boot
  document.addEventListener('DOMContentLoaded', init);
  window._testShowNode = showNode;
})();