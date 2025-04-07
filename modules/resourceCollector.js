const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');

module.exports = (bot) => {
  let collecting = false;

  const config = {
    collectables: ['diamond_ore', 'iron_ore', 'gold_ore', 'emerald_ore', 'coal_ore', 'redstone_ore', 'lapis_ore'],
    scanRadius: 32,
    delayBetweenTargets: 3000
  };

  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.loadPlugin(pathfinder);

  async function collectResources() {
    while (collecting) {
      const block = bot.findBlock({
        matching: block => config.collectables.includes(block.name),
        maxDistance: config.scanRadius
      });

      if (block) {
        bot.chat(`📦 Found ${block.name} at ${block.position}`);
        try {
          bot.pathfinder.setMovements(movements);
          bot.pathfinder.setGoal(new GoalNear(block.position.x, block.position.y, block.position.z, 1));

          await bot.once('goal_reached', () => {});
          await bot.dig(bot.blockAt(block.position));
          bot.chat(`⛏️ Mined ${block.name}`);
        } catch (err) {
          bot.chat(`⚠️ Error mining: ${err.message}`);
        }
      } else {
        bot.chat(`🔎 No resources found within ${config.scanRadius} blocks.`);
      }

      await sleep(config.delayBetweenTargets);
    }
  }

  function startCollecting() {
    if (collecting) return bot.chat('🧲 ResourceCollector already active.');
    collecting = true;
    bot.chat('🧲 ResourceCollector enabled.');
    collectResources();
  }

  function stopCollecting() {
    collecting = false;
    bot.chat('🛑 ResourceCollector stopped.');
    bot.pathfinder.setGoal(null);
  }

  // 💬 Chat command
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.collect')) return;
    const args = message.split(' ');
    if (args[1] === 'on') startCollecting();
    else if (args[1] === 'off') stopCollecting();
    else bot.chat('Usage: .collect on | off');
  });

  // 🛠️ From config
  if (bot.settingsData?.modules?.resourceCollector?.enabled) {
    startCollecting();
  }
};

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
