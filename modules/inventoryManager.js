module.exports = (bot) => {
  const settings = require('../settings.json').utils['inventory_manager'];
  if (!(settings.enabled)) return;

  function sortInventory() {
    const items = bot.inventory.items();

    let string = '🎒 Inventory: ';
    const counts = {};
    items.forEach(item => {
      counts[item.name] = (counts[item.name] || 0) + item.count;
    });

    console.log('[🎒 InventoryManager] Current Inventory:');
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`- ${name}: ${count}`);
      string += ` \n${name}: ${count},`
    });
    return string
  }

  bot.once('spawn', () => {
    console.log('[🎒 InventoryManager] Module active');
    setInterval(sortInventory, settings.interval || 60000); // default every 60s
  });

  bot.on('chat', (username, message) => {
    if (message === '.inv') {
      let inv = sortInventory();
      bot.chat('Nigaaaaaaaaaaaaaas inventory \n' + inv);
    }
  });
};
