module.exports = (bot) => {
  let isCooking = false;

  function startCooking() {
    if (isCooking) {
      bot.chat('🔥 Already cooking!');
      return;
    }

    const furnace = bot.findBlock({
      matching: (block) => block.name.includes('furnace'),
      maxDistance: 16
    });

    if (!furnace) {
      bot.chat('🚫 No furnace nearby!');
      return;
    }

    isCooking = true;
    bot.chat('🍳 Auto-cooking started!');
    cookLoop(furnace);
  }

  function stopCooking() {
    isCooking = false;
    bot.chat('🛑 Auto-cooking stopped!');
  }

  async function cookLoop(furnaceBlock) {
    const furnace = await bot.openFurnace(furnaceBlock);

    while (isCooking) {
      const rawFood = bot.inventory.items().find((item) =>
        ['raw_beef', 'raw_porkchop', 'raw_chicken', 'raw_cod', 'raw_salmon', 'potato'].includes(item.name)
      );

      const fuel = bot.inventory.items().find((item) =>
        ['coal', 'charcoal', 'wooden_pickaxe', 'log'].includes(item.name)
      );

      if (!rawFood || !fuel) {
        bot.chat('⚠️ Missing raw food or fuel.');
        await sleep(3000);
        continue;
      }

      try {
        await furnace.putInput(rawFood.type, null, rawFood.count);
        await furnace.putFuel(fuel.type, null, fuel.count);
        bot.chat(`🥩 Cooking ${rawFood.name}...`);

        await sleep(6000); // let some cooking happen
        const output = await furnace.takeOutput();
        if (output) {
          bot.chat(`✅ Took out ${output.name}`);
        }
      } catch (err) {
        bot.chat(`❌ Furnace fail: ${err.message}`);
      }
    }

    furnace.close();
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // 🔤 Chat command control
  bot.on('chat', (username, message) => {
    if (message === '.cook start') {
      bot.taskManager.add((done) => {
        startCooking();
        done();
      });
    }

    if (message === '.cook stop') {
      stopCooking();
    }
  });

  // ⚙️ Settings auto-start
  if (bot.settingsData?.modules?.autocook?.enabled) {
    bot.taskManager.add((done) => {
      startCooking();
      done();
    });
  }
};
