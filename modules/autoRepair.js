const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');

module.exports = (bot) => {
  const config = bot.settingsData?.modules?.autoRepair || {};
  if (!config.enabled) return;

  bot.loadPlugin(pathfinder);
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  let repairing = false;

  function isMendable(item) {
    return item && item.enchants?.some(e => e.name === 'mending') && item.durabilityUsed > 0;
  }

  function isItemDamaged(item) {
    return item && item.durabilityUsed && item.maxDurability &&
      item.durabilityUsed > (item.maxDurability * (config.threshold || 0.5));
  }

  function getDamagedItems() {
    return bot.inventory.items().filter(item => isItemDamaged(item) || isMendable(item));
  }

  function getXPOrbNearby() {
    return bot.nearestEntity(entity => entity.name === 'xp_orb' || entity.name === 'experience_orb');
  }

  async function goTo(entity) {
    await bot.pathfinder.goto(new GoalBlock(
      Math.floor(entity.position.x),
      Math.floor(entity.position.y),
      Math.floor(entity.position.z)
    ));
  }

  async function useMending() {
    const mendables = getDamagedItems().filter(isMendable);
    if (mendables.length === 0) return false;

    bot.chat('✨ Using Mending...');

    const handItem = bot.inventory.slots[bot.getEquipmentDestSlot('hand')];
    if (!isMendable(handItem)) {
      await bot.equip(mendables[0], 'hand');
    }

    const orb = getXPOrbNearby();
    if (!orb) {
      bot.chat('🔎 No XP orb found, idle until some drop...');
      return false;
    }

    await goTo(orb);
    return true;
  }

  async function useRepairBlock(type = 'anvil') {
    const block = bot.findBlock({
      matching: (block) => block.name.includes(type),
      maxDistance: 20
    });

    if (!block) {
      bot.chat(`❌ No ${type} found nearby.`);
      return false;
    }

    bot.chat(`🧭 Moving to ${type} at ${block.position}`);
    await bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
    bot.chat(`⚙️ Interacting with ${type}... (placeholder logic)`);
    return true;
  }

  async function repairCycle() {
    if (!repairing) return;

    const damaged = getDamagedItems();
    if (damaged.length === 0) {
      bot.chat('✅ No damaged or mendable items left.');
      return;
    }

    const mended = await useMending();
    if (!mended) {
      const repairedViaGrindstone = await useRepairBlock('grindstone');
      if (!repairedViaGrindstone) {
        await useRepairBlock('anvil');
      }
    }
  }

  bot.on('chat', (username, message) => {
    if (message === '.repair start') {
      if (repairing) return bot.chat('🧠 Already repairing...');
      repairing = true;
      bot.chat('🛠️ Auto repair enabled!');
      repairCycle();
      setInterval(repairCycle, config.interval || 60000);
    }

    if (message === '.repair stop') {
      repairing = false;
      bot.chat('🛑 Auto repair disabled!');
    }
  });
};
