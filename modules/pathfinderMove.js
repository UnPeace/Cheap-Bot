const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataLoader = require('minecraft-data');

module.exports = (bot) => {
  const pos = require('../settings.json').position;

  if (!pos.enabled) return;

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    const mcData = mcDataLoader(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);

    bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));

    console.log(`[🧭 Pathfinder] Moving to (${pos.x}, ${pos.y}, ${pos.z})`);
  });

  bot.on('goal_reached', () => {
    console.log(`[✅ Pathfinder] Arrived at destination: ${bot.entity.position}`);
  });
};
