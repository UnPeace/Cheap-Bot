const { pathfinder, Movements, goals: { GoalFollow } } = require('mineflayer-pathfinder');

module.exports = (bot) => {
  const config = bot.settingsData?.modules?.playerTracker || {};
  if (!config.enabled) return;

  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.loadPlugin(pathfinder);

  let trackingPlayer = null;

  async function followPlayer(username) {
    const target = bot.players[username]?.entity;
    if (!target) {
      bot.chat(`❌ Cannot find player ${username}.`);
      return;
    }

    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalFollow(target, config.followDistance || 2), true);
    trackingPlayer = username;

    bot.chat(`👣 Now following ${username}...`);
  }

  function stopFollowing() {
    trackingPlayer = null;
    bot.pathfinder.setGoal(null);
    bot.chat('🛑 Stopped following.');
  }

  bot.on('chat', (username, message) => {
    if (!message.startsWith('.track')) return;

    const args = message.split(' ');
    const cmd = args[1];

    if (cmd === 'stop') {
      stopFollowing();
    } else if (cmd) {
      followPlayer(cmd);
    } else {
      bot.chat('Usage: .track <playername> | .track stop');
    }
  });

  bot.on('entityGone', (entity) => {
    if (trackingPlayer && bot.players[trackingPlayer]?.entity?.id === entity.id) {
      bot.chat(`⚠️ Lost sight of ${trackingPlayer}. Stopping...`);
      stopFollowing();
    }
  });
};
