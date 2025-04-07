
module.exports = (bot) => {
  const settings = require('../settings.json').utils.random_afk;
  if (!(settings.enabled)) return;

  function afk() {
    const chance = Math.random();
    if (chance < 0.3) {
      const delay = Math.floor(Math.random() * (settings.maxDelay - settings.minDelay)) + settings.minDelay;
      console.log(`[😴 RandomAFK] Going AFK for ${delay / 2000}s...`);

      bot.clearControlStates();
      setTimeout(() => {
        bot.setControlState('jump', true);
        if (settings.sneak) bot.setControlState('sneak', true);
        console.log(`[😎 RandomAFK] Back from AFK.`);
      }, delay);
    }
  }

  bot.once('spawn', () => {
    setInterval(afk, 15000); // check every 15s if it should AFK
    console.log('[😴 RandomAFK] Random AFK module active');
  });
};
