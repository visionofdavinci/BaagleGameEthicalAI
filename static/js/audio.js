/* background music manager - loops SoundGame2 until midmorning_check, then switches to SoundGame1 */

window.AudioManager = (function () {
  const track1 = new Audio('FinalSoundGame.mpeg');

  track1.loop = true;
  track1.volume = 0.4;

  let started = false;
  let currentTrack = null;

  function startMusic() {
    if (started) return;
    started = true;
    currentTrack = track1;
    track1.play().catch(function () {});
  }

  function switchToTrack1() {
    if (currentTrack === track1) return;
    track1.pause();
    track1.currentTime = 0;
    currentTrack = track1;
    track1.play().catch(function () {});
  }

  // browsers block autoplay until user interaction - start on first click
  document.addEventListener('click', function () {
    startMusic();
  }, { once: true });

  return {
    startMusic: startMusic,
    switchToTrack1: switchToTrack1
  };
})();
