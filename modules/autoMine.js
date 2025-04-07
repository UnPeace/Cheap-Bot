const { Vec3 } = require('vec3');

module.exports = (bot) => {
  let isMining = false;
  let targetBlockName = null;

  function startMining(blockName) {
    if (isMining) {
      bot.chat('⛏️ Already mining!');
      return;
    }

    if (!blockName) {
      bot.chat('❌ Usage: .mine <block_name>');
      return;
    }

    targetBlockName = blockName.toLowerCase();
    isMining = true;
    bot.chat(`🪓 Auto-mining enabled for: ${targetBlockName}`);

    mineLoop();
  }

  function stopMining() {
    isMining = false;
    bot.chat('🛑 Auto-mining stopped.');
  }

  async function mineLoop() {
    while (isMining) {
      const block = bot.findBlock({
        matching: (b) => b && b.name === targetBlockName,
        maxDistance: 32,
      });

      if (!block) {
        bot.chat(`🔍 No '${targetBlockName}' blocks nearby.`);
        await sleep(3000);
        continue;
      }

      await new Promise((res) => {
        bot.movementUtils.walkToBlock(block, () => {
          bot.movementUtils.faceAndDig(block, res);
        });
      });

      await sleep(500); // tiny rest so the server doesn't rage quit
    }
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // 💬 Chat command
  bot.on('chat', (username, message) => {
    if (message.startsWith('.mine ')) {
      const args = message.split(' ');
      const blockName = args[1];
      bot.taskManager.add((done) => {
        startMining(blockName);
        done(); // Let it mine in background
      });
    }

    if (message === '.mine stop') {
      stopMining();
    }
  });

  // 🔗 Settings.json auto start
  if (bot.settingsData?.modules?.automine?.enabled) {
    const target = bot.settingsData.modules.automine.targetBlock || 'stone';
    bot.taskManager.add((done) => {
      startMining(target);
      done();
    });
  }
};
