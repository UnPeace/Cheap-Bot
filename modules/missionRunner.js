const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');

module.exports = (bot) => {
  let currentMission = null;

  const config = bot.settingsData?.modules?.missionRunner || {};
  if (!config.enabled) return;

  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.loadPlugin(pathfinder);

  const missions = {
    patrol: async () => {
      const points = config.patrolPoints || [];
      for (let i = 0; i < points.length && currentMission; i++) {
        const point = points[i];
        bot.chat(`🧭 Patrolling to (${point.x}, ${point.y}, ${point.z})`);
        await goTo(point);
        await sleep(2000);
      }
      bot.chat('✅ Patrol complete.');
    },
    deliver: async () => {
      const target = config.deliveryTarget;
      if (!target) return bot.chat('❌ No delivery target set.');
      bot.chat(`📦 Heading to deliver at (${target.x}, ${target.y}, ${target.z})`);
      await goTo(target);
      bot.chat('📦 Delivered.');
    },
    custom: async () => {
      const target = config.customTarget;
      if (!target) return bot.chat('❌ No custom target.');
      bot.chat(`🎯 Custom mission to (${target.x}, ${target.y}, ${target.z})`);
      await goTo(target);
      bot.chat('🎯 Mission complete.');
    }
  };

  async function goTo(pos) {
    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
    await new Promise((res) => bot.once('goal_reached', res));
  }

  function stopMission() {
    currentMission = null;
    bot.pathfinder.setGoal(null);
    bot.chat('🛑 Mission aborted.');
  }

  bot.on('chat', (username, message) => {
    if (!message.startsWith('.mission')) return;
    const args = message.split(' ');
    const cmd = args[1];

    if (cmd === 'patrol') {
      if (!currentMission) {
        currentMission = 'patrol';
        missions.patrol();
      } else bot.chat('⚠️ Already running a mission.');
    } else if (cmd === 'deliver') {
      if (!currentMission) {
        currentMission = 'deliver';
        missions.deliver();
      } else bot.chat('⚠️ Already running a mission.');
    } else if (cmd === 'custom') {
      if (!currentMission) {
        currentMission = 'custom';
        missions.custom();
      } else bot.chat('⚠️ Already running a mission.');
    } else if (cmd === 'stop') {
      stopMission();
    } else {
      bot.chat('Usage: .mission patrol | deliver | custom | stop');
    }
  });

  // Auto-start if configured
  if (config.autoStart) {
    currentMission = config.autoStart;
    missions[config.autoStart]?.();
  }
};

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
