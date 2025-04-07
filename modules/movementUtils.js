const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock } = goals;

module.exports = (bot) => {
  bot.once('spawn', () => {
    const { Vec3 } = require('vec3');
    const mcData = require('minecraft-data')(bot.version);
    const hostileMobs = [
      'zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'witch',
      'husk', 'stray', 'drowned', 'phantom', 'blaze', 'wither_skeleton',
      'piglin', 'piglin_brute', 'zoglin', 'ghast', 'slime', 'magma_cube',
      'shulker', 'evoker', 'vindicator', 'pillager', 'ravager', 'warden',
      'guardian', 'elder_guardian'
    ];

    // 🧠 Smart healing & screaming system
    let lastHungerScream = 0;

    bot.on('health', () => {
      const now = Date.now();

      let lastHealth = bot.health
      let lastDamageTime = 0

      bot.on('health', () => {
        const now = Date.now()

        // Scream only if actual damage occurred and not every single tick
        if (bot.health < lastHealth && now - lastDamageTime > 3000) {
          bot.chat(`😱 I've been hit! Health is now ${bot.health}/20`)
          lastDamageTime = now
        }

        lastHealth = bot.health
      })

      

      // Eat food if hungry
      if (bot.food < 20 && !bot.isEating) {
        const foodItem = bot.inventory.items().find(item => item.name.includes('beef') || item.name.includes('bread') || item.name.includes('apple') || item.name.includes('cooked_mutton'));
        if (foodItem) {
          bot.equip(foodItem, 'hand').then(() => {
            bot.activateItem();
          }).catch(() => {});
        }
      }

      // Scream every 20 seconds if still hungry
      if (bot.food < 20 && now - lastHungerScream > 20000) {
        bot.chat(`🥵 I'm starving!`);
        lastHungerScream = now;
      }
    });


    if (!mcData) return console.log("❌ Failed to load mcData for movementUtils.");
    if (!bot.pathfinder) bot.loadPlugin(pathfinder);

    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    let followInterval = null;
    let guardMode = false;
    let guardTarget = null;



    // ======================== Stop All functions ======================== //


    function stopAllGoals() {
      // Reset pathfinder goals
      bot.pathfinder.setGoal(null);

      // Stop follow mode
      if (followInterval) clearInterval(followInterval);
      followInterval = null;

      // Stop come mode
      comeActive = false;

      // Stop guard mode
      guardMode = false;
      currentGuardTarget = null;

      // Stop panic mode
      if (bot.panicMode) {
        bot.chat("Fiiine... Panic attack canceled 🫠");
        bot.panicMode = false;

        if (typeof stopSpinLoop === 'function') stopSpinLoop();
        if (typeof intruderWatchInterval !== 'undefined') clearInterval(intruderWatchInterval);
        bot.removeAllListeners('entityHurt');
      }

      // Stop circle mode
      if (typeof stopCircleMode === 'function') stopCircleMode();

      // Stop ride mode
      if (bot.riding) {
        bot.dismount().catch(() => {});
        bot.riding = false;
      }

      // Stop evade or avoid
      if (typeof stopEvadeMode === 'function') stopEvadeMode();

      // Stop parkour/autopilot
      if (typeof stopAutopilot === 'function') stopAutopilot();
      if (typeof stopParkour === 'function') stopParkour();

      // Stop cling mode (if implemented)
      if (typeof stopCling === 'function') stopCling();

      // Reset any queued movement commands
      if (typeof clearCommandQueue === 'function') clearCommandQueue();

      // General movement states
      bot.isFollowing = false;
      bot.isGuarding = false;
      bot.isCircling = false;
      bot.isPanicking = false;
      bot.isEvading = false;
      bot.isClinging = false;
      bot.isParkouring = false;
      bot.isAutopiloting = false;

      const mvopm = [
        "All movement functions stopped. I'm chill now 😎",
        "I ain't moving anymore 😎",
        "Never gonna move again 😎",
        "Frozen like Elsa ❄️",
        "You move me? Nah fam, I'm retired 😤",
        "BRB, Gotta take a break  🧘",
        "Feet? Overrated. I'm a statue now 🗿",
        "Call me the block monk, I move for no one 🧘‍♂️",
        "Standing still is the new meta 😌",
        "I'm not lazy, I'm in energy-saving mode 🔋",
        "No step November initiated 🚫🦶",
        "I used to move... then I took an arrow to the knee 🏹",
        "Offline but spiritually still here 🌌",
        "Why move when you can vibe 😎🎶",
        "Leg day? I don't know her 💅",
        "Bot.exe has stopped responding 💀",
        "Stationary supremacy 💪🧱",
        "Movement is for peasants. I float above time now ⏳",
        "I'm chilling harder than a snow golem on ice 🧊"
      ];
      bot.chat(mvopm[Math.floor(Math.random() * mvopm.length)]);


      
    }

//========================================================================//










    

    function walkTo(x, y, z, range = 1, cb = () => {}) {
      bot.pathfinder.setGoal(new GoalNear(x, y, z, range));
      bot.once('goal_reached', cb);
    }

    function walkToBlock(block, cb = () => {}) {
      if (!block?.position) return;
      walkTo(block.position.x, block.position.y, block.position.z, 1, cb);
    }

    function faceAndDig(block, cb = () => {}) {
      if (!block) return cb();
      bot.lookAt(block.position.offset(0.5, 0.5, 0.5), true, () => {
        bot.dig(block).then(cb).catch(() => cb());
      });
    }

    function jump() {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }

    function sneakJumpCombo() {
      bot.setControlState('sneak', true);
      jump();
      setTimeout(() => bot.setControlState('sneak', false), 500);
    }

    function followPlayer(playerName) {
      if (followInterval) clearInterval(followInterval);
      const player = bot.players[playerName]?.entity;
      if (!player) return bot.chat("Player not found.");
      bot.chat(`Following ${playerName}`);
      followInterval = setInterval(() => {
        const pos = player.position;
        bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1));
      }, 1000);
    }

    function stopFollowing() {
      if (followInterval) {
        clearInterval(followInterval);
        followInterval = null;
        bot.pathfinder.setGoal(null);
        bot.chat("Stopped following.");
      }
    }

    function enterGuardMode(player) {
      if (!player?.entity) return bot.chat("Can't guard ghost.");
      guardTarget = player.entity;
      guardMode = true;
      bot.chat(`🛡️ Guarding ${player.username} like they're baby Putin.`);

      const tick = () => {
        if (!guardMode || !guardTarget?.position) return;

        // Stick near player
        const { x, y, z } = guardTarget.position;
        bot.pathfinder.setGoal(new GoalNear(x, y, z, 2));

        // Scan for danger
        const hostiles = Object.values(bot.entities).filter(e =>
          e.type === 'mob' &&
          hostileMobs.includes(e.mobType?.toLowerCase()) &&
          e.position.distanceTo(bot.entity.position) < 16
        );

        // Attack closest hostile
        if (hostiles.length > 0) {
          const nearest = hostiles.reduce((a, b) =>
            a.position.distanceTo(bot.entity.position) < b.position.distanceTo(bot.entity.position) ? a : b
          );
          bot.chat(`⚔️ Defending with prejudice: ${nearest.name}`);
          bot.attack(nearest);
        }

        // Heal if needed
        if (bot.health < 15 && bot.food > 14) {
          bot.chat("🍗 Healing...");
          bot.activateItem(); // assumes food in hand
        }

        setTimeout(tick, 1000);
      };

      tick();
    }

    function stopGuarding() {
      guardMode = false;
      guardTarget = null;
      bot.pathfinder.setGoal(null);
      bot.chat("🛑 Guard mode deactivated.");
    }

    bot.movementUtils = {
      walkTo,
      walkToBlock,
      faceAndDig,
      jump,
      sneakJumpCombo,
      followPlayer,
      stopFollowing,
      stopAllGoals,
      enterGuardMode,
      stopGuarding
    };

    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      const args = message.trim().split(/\s+/);
      const command = args[0].toLowerCase();
      const target = bot.players[username]?.entity;

      if (command === '.come') {
        if (!target) return bot.chat("I can't see you.");
        stopAllGoals();
        const { x, y, z } = target.position;
        bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
      }

      if (command === '.follow') {
        if (!target) return bot.chat("Where tf are you?");
        stopAllGoals();
        followInterval = setInterval(() => {
          if (target?.position) {
            const { x, y, z } = target.position;
            bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
          }
        }, 1000);
      }

      if (command === '.goto' && args.length === 4) {
        const [ , x, y, z ] = args.map(Number);
        stopAllGoals();
        bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
        bot.chat(`Going to ${x}, ${y}, ${z}`);
      }

      if (command === '.stop' || command === '.mv' && args[1] === 'stop') {
        stopAllGoals();
        bot.chat("🛑 Movement stopped.");
      }

      if (command === '.guard') {
        stopAllGoals();
        enterGuardMode(bot.players[username]);
      }

      if (command === '.guardstop' || command === '.stopguard') {
        stopGuarding();
      }

      if (command === 'Which one is the  ?') {
        bot.chat('I am the bot, you are the bot, we are all bots. lol')
      }



      if (command === '.tp') {
        const subArg = args[1]?.toLowerCase(); // ep, w, cmd, etc.
        const coords = args.length >= 5 ? args.slice(2, 5).map(Number) : null;
        const targetPlayer = bot.players[username]?.entity;

        if (!targetPlayer && !coords) {
          bot.chat("❌ Invalid target or missing coords.");
          console.log("❌ Could not find player entity and no coords provided.");
          return;
        }

        let dest;

        // Use custom coords if provided
        if (coords && coords.every(n => !isNaN(n))) {
          dest = new Vec3(coords[0], coords[1], coords[2]);
        } else if (targetPlayer) {
          dest = targetPlayer.position;
        }

        const smartTeleport = async () => {
          if (!dest) {
            bot.chat("❌ Missing destination.");
            console.log("❌ No destination to teleport to.");
            return;
          }

          if (subArg === 'ep') {
            const pearl = bot.inventory.items().find(item => item.name.includes('ender_pearl'));
            if (!pearl) {
              bot.chat("❌ No ender pearl found.");
              return;
            }

            try {
              await bot.equip(pearl, 'hand');
              bot.lookAt(dest.offset(0.5, 1, 0.5));
              bot.chat("🌀 Yeeting pearl...");
              bot.activateItem();
              console.log("🌀 Ender pearl thrown toward target.");
            } catch (err) {
              bot.chat("❌ Failed to throw ender pearl.");
              console.log("❌ Ender pearl error:", err);
            }

          } else if (subArg === 'cmd') {
            // Only works on servers with /tp enabled
            bot.chat(`/tp ${Math.floor(dest.x)} ${Math.floor(dest.y)} ${Math.floor(dest.z)}`);
            console.log("🧠 Used /tp command to teleport.");

          } else {
            // Default teleport via pathfinder
            stopAllGoals();
            bot.chat(`🚶‍♂️ Walking to ${dest.x.toFixed(1)} ${dest.y.toFixed(1)} ${dest.z.toFixed(1)}`);
            console.log("🗺️ Pathfinder setGoal to Vec3:", dest);
            bot.pathfinder.setGoal(new GoalNear(dest.x, dest.y, dest.z, 1));
          }
        };
        

        smartTeleport();
      }




      if (command === '.tp' && args[1]?.toLowerCase() === 'dodgemyex') {
        const avoidPlayer = Object.values(bot.players)
          .map(p => p.entity)
          .filter(e => e && e.username !== username)
          .sort((a, b) =>
            a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position)
          )[0];

        if (!avoidPlayer) {
          bot.chat("👻 No toxic exes nearby to dodge.");
          return;
        }

        const myPos = bot.entity.position;
        const exPos = avoidPlayer.position;
        const direction = myPos.minus(exPos).normalize().scale(10); // Run 10 blocks away
        const fleeTo = myPos.plus(direction);

        const pearl = bot.inventory.items().find(item => item.name.includes('ender_pearl'));
        if (pearl) {
          bot.equip(pearl, 'hand').then(() => {
            bot.lookAt(fleeTo.offset(0.5, 1, 0.5));
            bot.activateItem();
            bot.chat("🧠 Yeeting myself away from bad decisions...");
            console.log("💨 Pearl thrown to dodge that walking red flag.");
          }).catch(() => {
            bot.chat("💔 Tried to vanish but I'm emotionally stuck.");
          });
        } else {
          bot.chat("🏃‍♂️ Running from emotional damage...");
          stopAllGoals();
          bot.pathfinder.setGoal(new GoalNear(fleeTo.x, fleeTo.y, fleeTo.z, 1));
        }
      }

      if (command === '.circle') {
        stopAllGoals();
        const center = target?.position;
        if (!center) return bot.chat("🫥 Can't see you. Try again.");
        bot.chat("🔄 Starting circular flex...");

        let angle = 0;
        const radius = 3;
        let circleActive = true;

        const circleTick = () => {
          if (!circleActive) return;

          angle += Math.PI / 8;
          const x = center.x + radius * Math.cos(angle);
          const z = center.z + radius * Math.sin(angle);
          const y = center.y;

          bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
          setTimeout(circleTick, 800);
        };

        circleTick();

        // Allow stopping it
        const stopCircle = () => {
          circleActive = false;
          bot.chat("🛑 Stopped circular flex.");
          bot.removeListener('chat', stopCircleCmd);
        };

        const stopCircleCmd = (username, msg) => {
          if ((msg === '.stop' || msg === '.mv stop') && circleActive) {
            stopCircle();
          }
        };

        bot.on('chat', stopCircleCmd);
      }


      if (command === '.ride') {
        stopAllGoals();

        const ridables = Object.values(bot.entities).filter(e =>
          ['mob', 'object'].includes(e.type) &&
          ['horse', 'donkey', 'mule', 'boat', 'minecart', 'pig', 'strider'].includes(e.name) &&
          e.position.distanceTo(bot.entity.position) < 10
        );

        if (ridables.length === 0) {
          bot.chat("😭 No Uber in range.");
          return;
        }

        const targetRide = ridables.reduce((a, b) =>
          a.position.distanceTo(bot.entity.position) < b.position.distanceTo(bot.entity.position) ? a : b
        );

        bot.chat(`🪑 Attempting to ride: ${targetRide.name}`);

        try {
          bot.mount(targetRide);
        } catch (err) {
          bot.chat("🥲 Couldn't ride it: " + err.message);
          console.error(err);
        }
      };


      // Add this inside your bot chat listener
      if (message.startsWith('.panic')) {
        if (bot.panicMode) {
          bot.chat("I'm already panicking!! 🫠");
          return;
        }

        bot.panicMode = true;
        bot.chat("AAAAAAAAAAAAAAAAA 😱 I'm PANICKING!!!");
        digPanicHole();
      }

      let panicHoleBlocks = [];

      async function digPanicHole() {
        const pos = bot.entity.position.offset(0, -1, 0);
        panicHoleBlocks = [];

        // Select a random nearby direction to run to first
        const offsetX = Math.floor(Math.random() * 10) - 5;
        const offsetZ = Math.floor(Math.random() * 10) - 5;
        const destination = pos.offset(offsetX, 0, offsetZ);

        bot.chat("Must dig hole... must escape reality... 😵‍💫");
        await bot.pathfinder.goto(new GoalNear(destination.x, destination.y, destination.z, 1));

        const center = bot.entity.position.floored().offset(0, -1, 0);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = 0; dy >= -2; dy--) {
              const blockPos = center.offset(dx, dy, dz);
              const block = bot.blockAt(blockPos);
              if (block && bot.canDigBlock(block)) {
                try {
                  await bot.dig(block);
                  panicHoleBlocks.push(blockPos);
                } catch (err) {
                  bot.chat("WHY IS THE DIRT SO STRONG 😭");
                }
              }
            }
          }
        }

        bot.chat("Hiding... they’ll never find me 😨");
        bot.setControlState('sneak', true);
        startSpinLoop();
        watchHoleIntruders();
      }

      let spinInterval
      let intruderWatchInterval

      function startSpinLoop() {
        let angle = 0
        spinInterval = setInterval(() => {
          angle += Math.PI / 8
          bot.look(angle % (2 * Math.PI), 0, true)
        }, 200)
      }

      function stopSpinLoop() {
        clearInterval(spinInterval)
        spinInterval = null
      }

      function watchHoleIntruders() {
        intruderWatchInterval = setInterval(() => {
          for (const pos of panicHoleBlocks) {
            const block = bot.blockAt(pos)
            if (!block || block.type === 0) {
              const closestPlayer = bot.nearestEntity(entity => entity.type === 'player' && entity !== bot.entity)
              if (closestPlayer) {
                bot.chat(`HEY! WHO TOUCHED MY DIRT? 🤬 I'm gonna SLAP ${closestPlayer.username}!!`)
                bot.attack(closestPlayer)
                bot.setControlState('jump', true)
                bot.setControlState('sprint', true)

                setTimeout(() => {
                  bot.setControlState('jump', false)
                  bot.setControlState('sprint', false)
                  stopSpinLoop()
                  bot.panicMode = false
                  bot.chat("Must dig another hole! 😱")
                  digPanicHole()
                }, 2000)

                clearInterval(intruderWatchInterval)
                return
              }
            }
          }
        }, 500)
      }
      

























      


















      
    });
    console.log("🦿 movementUtils fully online, now with god-tier guarding and fixed hostile filter.");
  });
};
