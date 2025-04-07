module.exports = (bot) => {
  const settings = require('../settings.json').utils['combatLogger'];
  if (!settings.enabled) return;

  let lastHealth = bot.health;

  bot.on('health', () => {
    if (bot.health < lastHealth) {
      console.log(`[⚠️ CombatLogger] Bot took damage! Health: ${bot.health}`);
      bot.chat('Combat logger triggered!');
    }
    lastHealth = bot.health;
  });

  bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
      console.log('[💢 CombatLogger] Bot is being attacked!');
    }
  });

  console.log('[💀 CombatLogger] Module enabled — no mercy, no trust');
};
