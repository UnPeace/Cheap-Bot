const { Vec3 } = require('vec3');

module.exports = (bot) => {
  let isFishing = false;

  async function startFishing() {
    if (isFishing) return;
    isFishing = true;
    bot.chat('🎣 Starting auto-fishing');

    while (isFishing) {
      try {
        const rod = bot.inventory.items().find(i => i.name.includes('fishing_rod'));
        if (!rod) {
          bot.chat("❌ No fishing rod found.");
          break;
        }

        await bot.equip(rod, 'hand');
        await bot.activateItem();

        await waitForSplash();

        await bot.deactivateItem();
        await sleep(1000); // delay before casting again
      } catch (err) {
        bot.chat("⚠️ Error during fishing: " + err.message);
      }
    }
  }

  function stopFishing() {
    isFishing = false;
    bot.deactivateItem();
    bot.chat("🛑 Auto-fishing stopped.");
  }

  function waitForSplash() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("No splash detected (timeout)"));
      }, 20000);

      function onParticle(particleName, pos) {
        if (particleName === 'bubble' || particleName === 'splash') {
          cleanup();
          resolve();
        }
      }

      function cleanup() {
        bot.removeListener('particle', onParticle);
        clearTimeout(timeout);
      }

      bot.on('particle', onParticle);
    });
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 🔗 Chat commands
  bot.on('chat', (username, message) => {
    if (message === '.fish start') {
      bot.taskManager.add((done) => {
        startFishing().then(done).catch(() => done());
      });
    }

    if (message === '.fish stop') {
      stopFishing();
    }
  });

  // 🔗 Settings.json toggle
  if (bot.settingsData?.modules?.autofish?.enabled) {
    bot.taskManager.add((done) => {
      startFishing().then(done).catch(() => done());
    });
  }
};