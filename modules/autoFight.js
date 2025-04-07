const { GoalFollow } = require('mineflayer-pathfinder').goals;

module.exports = (bot) => {
  let isAutoFightEnabled = false;

  const weaponPriority = ['diamond_sword', 'iron_sword', 'stone_sword'];

  function enableAutoFight() {
    if (isAutoFightEnabled) return bot.chat('⚔️ AutoFight already active.');
    isAutoFightEnabled = true;
    bot.chat('🧨 AutoFight enabled!');
    fightLoop();
  }

  function disableAutoFight() {
    isAutoFightEnabled = false;
    bot.pathfinder.setGoal(null);
    bot.chat('🛑 AutoFight disabled.');
  }

  async function fightLoop() {
    while (isAutoFightEnabled) {
      const target = bot.nearestEntity(e => e.type === 'mob' && e.mobType !== 'Armor Stand' && e.position.distanceTo(bot.entity.position) < 10);
      if (target) {
        equipBestWeapon();
        bot.pathfinder.setGoal(new GoalFollow(target, 1), true);

        if (bot.entity.position.distanceTo(target.position) < 3) {
          bot.attack(target);
        }
      }
      await sleep(300);
    }
  }

  function equipBestWeapon() {
    const sword = bot.inventory.items().find(item => weaponPriority.includes(item.name));
    if (sword) {
      bot.equip(sword, 'hand').catch(() => {});
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 💬 In-game chat command
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.')) return;

    const args = message.split(' ');
    if (args[0] === '.autofight') {
      if (args[1] === 'on') enableAutoFight();
      else if (args[1] === 'off') disableAutoFight();
      else bot.chat('Usage: .autofight on | off');
    }
  });

  // ⚙️ Settings-based toggle
  if (bot.settingsData?.modules?.autofight?.enabled) {
    enableAutoFight();
  }
};
