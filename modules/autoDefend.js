module.exports = (bot) => {
  const mcData = require('minecraft-data')(bot.version);
  let autoDefendEnabled = false;

  function enableAutoDefend() {
    if (autoDefendEnabled) return bot.chat('🛡️ AutoDefend already active.');
    autoDefendEnabled = true;
    bot.chat('⚔️ AutoDefend enabled. Hostiles beware.');
  }

  function disableAutoDefend() {
    autoDefendEnabled = false;
    bot.chat('🛑 AutoDefend disabled.');
  }

  function isHostile(entity) {
    const hostiles = ['zombie', 'skeleton', 'creeper', 'spider', 'witch', 'enderman'];
    return entity?.type === 'mob' && hostiles.includes(entity.name);
  }

  bot.on('entityHurt', (entity) => {
    if (!autoDefendEnabled) return;
    if (!entity || !entity.position) return;

    const dist = bot.entity.position.distanceTo(entity.position);
    if (isHostile(entity) && dist < 10) {
      bot.chat(`🧟 Engaging nearby hostile: ${entity.name}`);
      bot.lookAt(entity.position.offset(0, 1.6, 0));
      bot.attack(entity);
    }
  });

  bot.on('entitySwingArm', (entity) => {
    if (!autoDefendEnabled) return;
    if (!entity || entity.type !== 'player') return;

    const dist = bot.entity.position.distanceTo(entity.position);
    if (dist < 3 && entity.username !== bot.username) {
      bot.chat(`🛡️ Detected attack! Retaliating on ${entity.username}`);
      bot.attack(entity);
    }
  });

  // 💬 Chat command: .autodefend on | off
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.autodefend')) return;
    const args = message.split(' ');
    if (args[1] === 'on') enableAutoDefend();
    else if (args[1] === 'off') disableAutoDefend();
    else bot.chat('Usage: .autodefend on | off');
  });

  // 🔧 Load from settings.json
  if (bot.settingsData?.modules?.autodefend?.enabled) {
    enableAutoDefend();
  }
};
