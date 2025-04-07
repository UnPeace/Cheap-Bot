module.exports = (bot) => {
  const armorSlots = {
    head: 'helmet',
    torso: 'chestplate',
    legs: 'leggings',
    feet: 'boots',
  };

  const weaponPriority = [
    'netherite_sword',
    'diamond_sword',
    'iron_sword',
    'stone_sword',
    'golden_sword',
    'wooden_sword'
  ];

  const armorPriority = [
    'netherite', 'diamond', 'iron', 'golden', 'leather', 'chainmail'
  ];

  let autoEquipEnabled = false;

  function enableAutoEquip() {
    if (autoEquipEnabled) return bot.chat('🛡️ AutoEquip already active.');
    autoEquipEnabled = true;
    bot.chat('🔧 AutoEquip enabled!');
    equipBestItemsLoop();
  }

  function disableAutoEquip() {
    autoEquipEnabled = false;
    bot.chat('🛑 AutoEquip disabled.');
  }

  async function equipBestItemsLoop() {
    while (autoEquipEnabled) {
      try {
        await equipBestArmor();
        await equipBestWeapon();
      } catch (err) {
        bot.chat(`⚠️ AutoEquip error: ${err.message}`);
      }
      await sleep(3000); // Check every 3 seconds
    }
  }

  async function equipBestWeapon() {
    const inv = bot.inventory.items();
    for (let weaponName of weaponPriority) {
      const weapon = inv.find(item => item.name === weaponName);
      if (weapon) {
        await bot.equip(weapon, 'hand');
        break;
      }
    }
  }

  async function equipBestArmor() {
    const inv = bot.inventory.items();

    for (let [slot, type] of Object.entries(armorSlots)) {
      let best = null;

      for (let priority of armorPriority) {
        const item = inv.find(i => i.name.includes(priority) && i.name.includes(type));
        if (item) {
          best = item;
          break;
        }
      }

      if (best) {
        await bot.equip(best, slot);
      }
    }
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 🧠 Chat command: .autoequip on | off
  bot.on('chat', (username, message) => {
    if (!message.startsWith('.autoequip')) return;
    const args = message.split(' ');
    if (args[1] === 'on') enableAutoEquip();
    else if (args[1] === 'off') disableAutoEquip();
    else bot.chat('Usage: .autoequip on | off');
  });

  // 🛠️ Startup check
  if (bot.settingsData?.modules?.autoequip?.enabled) {
    enableAutoEquip();
  }
};
