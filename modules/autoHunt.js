module.exports = (bot) => {
  let isHunting = false;

  const meatMobs = ['cow', 'pig', 'chicken', 'sheep', 'rabbit'];

  function startHunting() {
    if (isHunting) {
      bot.chat('🔪 Already hunting!');
      return;
    }

    isHunting = true;
    bot.chat('🍗 Auto-hunting started!');
    huntLoop();
  }

  function stopHunting() {
    isHunting = false;
    bot.chat('🛑 Auto-hunting stopped!');
  }

  async function huntLoop() {
    while (isHunting) {
      const target = bot.nearestEntity(entity =>
        entity.type === 'mob' && meatMobs.includes(entity.name)
      );

      if (target) {
        try {
          await goAndMurder(target);
        } catch (err) {
          bot.chat(`❌ Hunting fail: ${err.message}`);
        }
      } else {
        bot.chat('🔍 No meat mob nearby. Searching...');
        await sleep(3000);
      }
    }
  }

  async function goAndMurder(entity) {
    const { pathfinder, goals: { GoalFollow } } = require('mineflayer-pathfinder');
    bot.pathfinder.setGoal(new GoalFollow(entity, 1), true);

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!entity.isValid || !isHunting) {
          clearInterval(interval);
          return resolve();
        }

        if (bot.entity.position.distanceTo(entity.position) < 3) {
          bot.attack(entity);
        }
      }, 300);
    });
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 🧾 Chat commands
  bot.on('chat', (username, message) => {
    if (message === '.hunt start') {
      bot.taskManager.add((done) => {
        startHunting();
        done();
      });
    }

    if (message === '.hunt stop') {
      stopHunting();
    }
  });

  // ⚙️ Auto-enable from settings.json
  if (bot.settingsData?.modules?.autohunt?.enabled) {
    bot.taskManager.add((done) => {
      startHunting();
      done();
    });
  }
};
