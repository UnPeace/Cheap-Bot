module.exports = (bot) => {
  let autoHealEnabled = false;

  const healThreshold = bot.settingsData?.modules?.autoheal?.threshold || 14; // default = 14 HP
  const healDelay = bot.settingsData?.modules?.autoheal?.checkDelay || 3000;

  function enableAutoHeal() {
    if (autoHealEnabled) return bot.chat('❤️ AutoHeal is already active.');
    autoHealEnabled = true;
    bot.chat('🩺 AutoHeal enabled!');
    autoHealLoop();
  }

  function disableAutoHeal() {
    autoHealEnabled = false;
    bot.chat('❌ AutoHeal disabled.');
  }

  async function autoHealLoop() {
    while (autoHealEnabled) {
      try {
        const health = bot.health;
        const food = bot.food;

        if (health < healThreshold && food > 6) {
          const foodItem = getBestFood();
          if (foodItem) {
            await bot.equip(foodItem, 'hand');
            await bot.consume();
            bot.chat(`🍗 Healing with ${foodItem.name}`);
          }
        }
      } catch (err) {
        bot.chat(`⚠️ AutoHeal error: ${err.message}`);
      }
      await sleep(healDelay);
    }
  }

  function getBestFood() {
    const foodItems = bot.inventory.items().filter(item => item.name.includes('_cooked') || item.name.includes('bread') || item.name.includes('apple'));
    return foodItems.length > 0 ? foodItems[0] : null;
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 💬 Chat command: .autoheal on | off
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.autoheal')) return;
    const args = message.split(' ');
    if (args[1] === 'on') enableAutoHeal();
    else if (args[1] === 'off') disableAutoHeal();
    else bot.chat('Usage: .autoheal on | off');
  });

  // 🔧 Load from settings.json
  if (bot.settingsData?.modules?.autoheal?.enabled) {
    enableAutoHeal();
  }
};
