const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');

module.exports = (bot) => {
  const config = bot.settingsData?.modules?.autoEnchant || {};
  if (!config.enabled) return;

  bot.loadPlugin(pathfinder);
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  let enchanting = false;

  function getEnchantableItems() {
    return bot.inventory.items().filter(item => {
      return item && item.name !== 'book' && !item.nbt?.value?.Enchantments;
    });
  }

  function hasLapis() {
    return bot.inventory.items().some(item => item.name === 'lapis_lazuli');
  }

  async function findEnchantTable() {
    return bot.findBlock({
      matching: block => block.name === 'enchanting_table',
      maxDistance: 20
    });
  }

  async function goToBlock(block) {
    return bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
  }

  async function enchantItems() {
    const items = getEnchantableItems();
    if (items.length === 0) {
      bot.chat('✨ Nothing to enchant.');
      return;
    }

    const table = await findEnchantTable();
    if (!table) {
      bot.chat('📦 Enchanting table not found.');
      return;
    }

    if (!hasLapis()) {
      bot.chat('🔷 No lapis lazuli found in inventory.');
      return;
    }

    bot.chat(`🧙 Heading to enchanting table at ${table.position}`);
    await goToBlock(table);

    for (const item of items) {
      try {
        await bot.equip(item, 'hand');
        bot.chat(`🔮 Enchanting ${item.name}...`);
        // NOTE: Actual enchanting interaction needs external mod support, not implemented in vanilla mineflayer
      } catch (err) {
        bot.chat(`❌ Failed to enchant ${item.name}`);
        console.log(err);
      }
    }
  }

  bot.on('chat', async (username, message) => {
    if (message === '.enchant start') {
      if (enchanting) return bot.chat('🧠 Already enchanting...');
      enchanting = true;
      bot.chat('🔮 Auto enchanting enabled!');
      await enchantItems();
    }

    if (message === '.enchant stop') {
      enchanting = false;
      bot.chat('🛑 Auto enchanting disabled!');
    }
  });
};
