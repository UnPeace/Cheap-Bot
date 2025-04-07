const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');
const Vec3 = require('vec3');

module.exports = (bot) => {
  const config = bot.settingsData?.modules?.autoExplore || {};
  if (!config.enabled) return;

  bot.loadPlugin(pathfinder);

  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);

  let exploring = false;
  let lastExplore = null;
  const exploreDistance = config.distance || 50;

  function getRandomDirection() {
    const x = bot.entity.position.x + Math.floor(Math.random() * exploreDistance * 2) - exploreDistance;
    const z = bot.entity.position.z + Math.floor(Math.random() * exploreDistance * 2) - exploreDistance;
    const y = bot.entity.position.y;

    return new Vec3(x, y, z);
  }

  async function exploreNext() {
    if (!exploring) return;

    const target = getRandomDirection();
    bot.chat(`🧭 Exploring to ${target.x.toFixed(0)}, ${target.y.toFixed(0)}, ${target.z.toFixed(0)}`);
    bot.pathfinder.setGoal(new GoalBlock(target.x, target.y, target.z));
    lastExplore = target;
  }

  bot.on('goal_reached', () => {
    if (exploring) {
      setTimeout(exploreNext, 1000);
    }
  });

  bot.on('chat', (username, message) => {
    if (message === '.explore start') {
      exploring = true;
      bot.chat('🌍 Auto explore activated.');
      exploreNext();
    }

    if (message === '.explore stop') {
      exploring = false;
      bot.pathfinder.setGoal(null);
      bot.chat('🛑 Auto explore stopped.');
    }
  });
};
