/* background music manager — loops SoundGame2 until midmorning_check, then switches to SoundGame1 */

window.AudioManager = (function () {
  const track1 = new Audio('SoundGame1.mpeg');
  const track2 = new Audio('SoundGame2.mpeg');

  track1.loop = true;
  track2.loop = true;
  track1.volume = 0.3;
  track2.volume = 0.3;

  let started = false;
  let currentTrack = null;

  function startMusic() {
    if (started) return;
    started = true;
    currentTrack = track2;
    track2.play().catch(function () {});
  }

  function switchToTrack1() {
    if (currentTrack === track1) return;
    track2.pause();
    track2.currentTime = 0;
    currentTrack = track1;
    track1.play().catch(function () {});
  }

  // browsers block autoplay until user interaction — start on first click
  document.addEventListener('click', function () {
    startMusic();
  }, { once: true });

  return {
    startMusic: startMusic,
    switchToTrack1: switchToTrack1
  };
})();
