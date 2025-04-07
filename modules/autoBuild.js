const fs = require('fs');
const path = require('path');
const Schematic = require('prismarine-schematic');
const { Vec3 } = require('vec3');

module.exports = async (bot) => {
  const config = bot.settingsData?.modules?.autoBuild || {};
  if (!config.enabled) return;

  const baseDir = path.join(__dirname, '..', 'schematics');
  const schematicName = config.schematic || 'mini_iron_farm.schematic';
  const filePath = path.join(baseDir, schematicName);

  if (!fs.existsSync(filePath)) {
    bot.chat(`📦 Schematic not found: ${schematicName}`);
    return;
  }

  const buildOrigin = bot.entity.position.floored();

  try {
    const schematic = await Schematic.read(filePath);
    const size = schematic.size;
    const offset = new Vec3(0, 0, 0);

    bot.chat(`🏗️ Starting autobuild: ${schematicName}`);

    for (let y = 0; y < size.y; y++) {
      for (let z = 0; z < size.z; z++) {
        for (let x = 0; x < size.x; x++) {
          const block = schematic.getBlock(new Vec3(x, y, z));
          const targetPos = buildOrigin.offset(x + offset.x, y + offset.y, z + offset.z);

          if (block.name === 'air') continue;
          const existing = bot.blockAt(targetPos);
          if (existing && existing.name === block.name) continue;

          await placeBlockSmart(bot, block.name, targetPos);
        }
      }
    }

    bot.chat(`✅ Build complete: ${schematicName}`);
  } catch (err) {
    console.error(`[AutoBuild] Error:`, err.message);
    bot.chat(`❌ Autobuild failed: ${err.message}`);
  }
};

async function placeBlockSmart(bot, blockName, position) {
  return new Promise(async (resolve) => {
    try {
      const item = bot.inventory.items().find(i => i.name === blockName);
      if (!item) return resolve();

      const refBlock = bot.blockAt(position.offset(0, -1, 0)) || bot.blockAt(position);
      if (!refBlock || refBlock.boundingBox === 'empty') return resolve();

      await bot.equip(item, 'hand');
      await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
      await bot.waitForTicks(2);

      resolve();
    } catch {
      resolve();
    }
  });
}
