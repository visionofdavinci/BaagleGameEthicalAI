// ── START SCREEN → CONTRACT SCREEN ──────────────────────
    const startScreen    = document.getElementById('start-screen');
    const contractScreen = document.getElementById('contract-screen');
    const playButton     = document.getElementById('play-button');
    const sigInput       = document.getElementById('sig-input');
    const btnSend        = document.getElementById('btn-send');
    const btnDecline     = document.getElementById('btn-decline');
    const declineTooltip = document.getElementById('decline-tooltip');
    const sigDate        = document.getElementById('sig-date');
    const contractPaper  = document.getElementById('contract-paper');
 
    // Set today's date on the contract
    const now = new Date();
    sigDate.textContent = `Date: ${now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })}`;
 
    // Play → show contract
    playButton.addEventListener('click', () => {
      startScreen.style.transition = 'opacity 0.4s ease';
      startScreen.style.opacity    = '0';
      startScreen.style.pointerEvents = 'none';
 
      setTimeout(() => {
        startScreen.style.display = 'none';
        contractScreen.classList.add('visible');
        sigInput.focus();
      }, 400);
    });
 
    // Enable Send only when name is typed
    sigInput.addEventListener('input', () => {
      const hasName = sigInput.value.trim().length > 0;
      btnSend.disabled = !hasName;
 
 
    });
 
    let declineCount = 0;
    const declineLines = [
      "An opportunity like this does not come every day.",
      "We regret to inform you that your rejection has been rejected.",
      "This is your third attempt, HR has been notified",
      "...",
    ];
 
    btnDecline.addEventListener('click', () => {
      contractPaper.classList.remove('shake');
      void contractPaper.offsetWidth; 
      contractPaper.classList.add('shake');
      contractPaper.addEventListener('animationend', () => {
        contractPaper.classList.remove('shake');
      }, { once: true });
 
      declineTooltip.textContent = declineLines[Math.min(declineCount, declineLines.length - 1)];
      declineTooltip.classList.add('show');
      declineCount++;
 
      clearTimeout(btnDecline._tipTimer);
      btnDecline._tipTimer = setTimeout(() => {
        declineTooltip.classList.remove('show');
      }, 2000);
    });
 
    // Sign & Send → flash out → reveal desktop
    btnSend.addEventListener('click', () => {
      if (btnSend.disabled) return;
 
      // Brief pause then fade out
      setTimeout(() => {
        contractScreen.classList.add('flash-out');
        contractScreen.addEventListener('animationend', () => {
          contractScreen.style.display = 'none';
          // ← trigger whatever starts your actual game here
          // e.g.: initDesktop(); or document.getElementById('desktop').classList.add('active');
        }, { once: true });
      }, 400);
    });