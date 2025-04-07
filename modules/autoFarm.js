const { Vec3 } = require('vec3');

module.exports = (bot) => {
  let isFarming = false;
  const FARMABLES = ['wheat', 'carrots', 'potatoes', 'beetroots'];

  function startFarming() {
    if (isFarming) {
      bot.chat('🌽 Already farming!');
      return;
    }

    isFarming = true;
    bot.chat('🚜 Auto-farming started!');
    farmLoop();
  }

  function stopFarming() {
    isFarming = false;
    bot.chat('🛑 Auto-farming stopped!');
  }

  async function farmLoop() {
    while (isFarming) {
      const block = bot.findBlock({
        matching: (b) => FARMABLES.includes(b.name) && b.metadata === 7,
        maxDistance: 32,
      });

      if (!block) {
        bot.chat('🔍 No mature crops nearby.');
        await sleep(3000);
        continue;
      }

      await new Promise((res) => {
        bot.movementUtils.walkToBlock(block, () => {
          bot.movementUtils.faceAndDig(block, async () => {
            const seed = findSeedFor(block.name);
            if (seed) {
              await bot.equip(seed, 'hand');
              bot.placeBlock(block, new Vec3(0, 1, 0)).catch(() => {});
            }
            res();
          });
        });
      });

      await sleep(500);
    }
  }

  function findSeedFor(cropName) {
    const match = {
      wheat: 'wheat_seeds',
      carrots: 'carrot',
      potatoes: 'potato',
      beetroots: 'beetroot_seeds',
    };
    return bot.inventory.items().find(i => i.name === match[cropName]);
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 💬 In-game chat commands
  bot.on('chat', (username, message) => {
    if (message === '.farm start') {
      bot.taskManager.add((done) => {
        startFarming();
        done();
      });
    }

    if (message === '.farm stop') {
      stopFarming();
    }
  });

  // 🔗 Settings.json toggle
  if (bot.settingsData?.modules?.autofarm?.enabled) {
    bot.taskManager.add((done) => {
      startFarming();
      done();
    });
  }
};
