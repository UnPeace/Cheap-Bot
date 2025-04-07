const { GoalFollow } = require('mineflayer-pathfinder').goals;

module.exports = (bot) => {
  let isPvPMode = false;
  let targetPlayer = null;

  const foodList = ['cooked_beef', 'cooked_porkchop', 'golden_apple'];
  const weaponPriority = ['diamond_sword', 'iron_sword', 'stone_sword', 'wooden_sword'];

  function startPvP(targetName) {
    if (isPvPMode) return bot.chat('🛡️ Already in PvP mode.');

    isPvPMode = true;
    targetPlayer = targetName ? bot.players[targetName]?.entity : null;
    bot.chat(`⚔️ PvP mode activated${targetName ? ` against ${targetName}` : ''}!`);
    pvpLoop();
  }

  function stopPvP() {
    isPvPMode = false;
    targetPlayer = null;
    bot.chat('🛑 PvP mode deactivated.');
  }

  async function pvpLoop() {
    while (isPvPMode) {
      await autoEat();
      equipBestGear();

      const target = targetPlayer || bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
      if (target) await engageTarget(target);
      await sleep(300);
    }
  }

  function equipBestGear() {
    const sword = findBestItem(weaponPriority);
    if (sword) bot.equip(sword, 'hand').catch(() => {});

    const armorSlots = ['head', 'torso', 'legs', 'feet'];
    armorSlots.forEach(slot => {
      const bestArmor = findBestArmor(slot);
      if (bestArmor) bot.equip(bestArmor, slot).catch(() => {});
    });
  }

  function findBestItem(priorityList) {
    return bot.inventory.items().find(item => priorityList.includes(item.name));
  }

  function findBestArmor(slot) {
    const types = {
      head: ['diamond_helmet', 'iron_helmet', 'chainmail_helmet', 'golden_helmet', 'leather_helmet'],
      torso: ['diamond_chestplate', 'iron_chestplate', 'chainmail_chestplate', 'golden_chestplate', 'leather_chestplate'],
      legs: ['diamond_leggings', 'iron_leggings', 'chainmail_leggings', 'golden_leggings', 'leather_leggings'],
      feet: ['diamond_boots', 'iron_boots', 'chainmail_boots', 'golden_boots', 'leather_boots'],
    };
    return findBestItem(types[slot]);
  }

  async function autoEat() {
    if (bot.food < 18 || bot.health < 15) {
      const food = bot.inventory.items().find(item => foodList.includes(item.name));
      if (food) {
        try {
          await bot.equip(food, 'hand');
          await bot.consume();
        } catch (err) {
          bot.chat(`🍗 Failed to eat: ${err.message}`);
        }
      }
    }
  }

  async function engageTarget(target) {
    if (!target.isValid) return;

    bot.pathfinder.setGoal(new GoalFollow(target, 1), true);

    if (bot.entity.position.distanceTo(target.position) < 3) {
      bot.attack(target);
    }
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 🗨️ In-game chat commands
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.')) return;

    const args = message.split(' ');

    if (args[0] === '.pvp') {
      const sub = args[1];

      if (sub === 'on') {
        startPvP();
      } else if (sub === 'off') {
        stopPvP();
      } else if (sub === 'train' && args[2]) {
        startPvP(args[2]);
      } else {
        bot.chat('Usage: .pvp on | .pvp off | .pvp train <player>');
      }
    }
  });

  // ⚙️ Enable via settings.json
  if (bot.settingsData?.modules?.pvpmode?.enabled) {
    startPvP(bot.settingsData.modules.pvpmode?.target || null);
  }
};
