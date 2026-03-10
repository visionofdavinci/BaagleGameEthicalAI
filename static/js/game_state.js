/* tracks the current state of the game in terms of parameters we want to look at - like a history of updates to a dictionary */

(function () {
  const state = {
    productivity: 50,
    energy: 50,
    happiness: 50,
    turn: 0,
    history: []   // log of every choice: { nodeId, choiceIndex, effects }
  };

  function updateStats(effects) {
    if (effects.productivity !== undefined) state.productivity += effects.productivity;
    if (effects.energy !== undefined)       state.energy += effects.energy;
    if (effects.happiness !== undefined)    state.happiness += effects.happiness;

    // clamp between 0–100
    state.productivity = Math.max(0, Math.min(100, state.productivity));
    state.energy       = Math.max(0, Math.min(100, state.energy));
    state.happiness    = Math.max(0, Math.min(100, state.happiness));

    state.turn++;
  }

  function logChoice(nodeId, choiceIndex, effects) {
    state.history.push({ nodeId, choiceIndex, effects, turn: state.turn });
  }

  function getState() {
    // return a copy so nothing mutates it directly
    return Object.assign({}, state);
  }

  // determine which ending the player gets
  function getEnding() {
    // priority: data_leak > burnout > fired
    if (state.happiness < 15) return 'ending_dataleak';
    if (state.energy < 20)    return 'ending_burnout';
    if (state.productivity < 35) return 'ending_fired';

    // fallback — the system is rigged, nobody truly wins
    // pick the "closest" bad ending
    const lowest = Math.min(state.productivity, state.energy, state.happiness);
    if (lowest === state.happiness)    return 'ending_dataleak';
    if (lowest === state.energy)       return 'ending_burnout';
    return 'ending_fired';
  }

  window.GameState = { updateStats, logChoice, getState, getEnding };
})();