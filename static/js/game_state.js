/* tracks the current state of the game in terms of parameters we want to look at - like a history of updates to a dictionary */

(function () {
  const state = {
    productivity: 50,
    ai_reliance: 50,
    happiness: 50,
    turn: 0,
    history: []   // log of every choice: { nodeId, choiceIndex, effects }
  };

  function updateStats(effects) {
    if (effects.productivity !== undefined) state.productivity += effects.productivity;
    if (effects.ai_reliance !== undefined)       state.ai_reliance += effects.ai_reliance;
    if (effects.happiness !== undefined)    state.happiness += effects.happiness;

    // clamp between 0–100
    state.productivity = Math.max(0, Math.min(100, state.productivity));
    state.ai_reliance       = Math.max(0, Math.min(100, state.ai_reliance));
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
    console.log('ai_reliance:', state.ai_reliance)
    console.log('productivity:', state.productivity)
    if (state.ai_reliance > 80)    return 'ending_dataleak';
    if (state.productivity < 50) return 'ending_fired';
    return 'ending_employee';

    // fallback
    // pick the "closest" bad ending
    //const highest = Math.max(state.productivity, state.ai_reliance);
    //if (highest === state.productivity)    return 'ending_employee';
    //if (highest === state.ai_reliance)       return 'ending_dataleak';
    //return 'ending_fired';
  }

  window.GameState = { updateStats, logChoice, getState, getEnding };
})();