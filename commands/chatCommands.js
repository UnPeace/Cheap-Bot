const fs = require('fs');
const path = require('path');
const { Vec3 } = require('vec3');

module.exports = (bot, settings, activeModules, moduleToggles) => {
  const owner = settings.botAccount?.username?.toLowerCase();

  const isOwner = (username) => username.toLowerCase() === owner;

  bot.on('chat', async (username, message) => {
    if (!isOwner(username)) return;

    if (!message.startsWith('.')) return;
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'help':
        bot.chat('Available: follow, stop, coords, inv, health, mine, attack, pathfind, enable, disable, status');
        break;

      case 'coords':
        const pos = bot.entity.position;
        bot.chat(`📍 X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`);
        break;

      case 'inv':
        const items = bot.inventory.items();
        if (items.length === 0) return bot.chat('Inventory empty.');
        items.forEach(item => bot.chat(`${item.name} x${item.count}`));
        break;

      case 'health':
        bot.chat(`❤️ Health: ${bot.health} | Food: ${bot.food}`);
        break;

      case 'follow':
        const targetName = args[0];
        const target = bot.players[targetName]?.entity;
        if (!target) return bot.chat(`Couldn't find player: ${targetName}`);
        const { GoalFollow } = require('mineflayer-pathfinder').goals;
        bot.pathfinder.setGoal(new GoalFollow(target, 1), true);
        bot.chat(`👣 Following ${targetName}`);
        break;

      case 'pathfind':
        if (args.length < 3) return bot.chat('Usage: .pathfind <x> <y> <z>');
        const [x, y, z] = args.map(Number);
        const { GoalBlock } = require('mineflayer-pathfinder').goals;
        bot.pathfinder.setGoal(new GoalBlock(x, y, z));
        bot.chat(`🗺️ Pathfinding to (${x}, ${y}, ${z})`);
        break;

      case 'stop':
        bot.clearControlStates();
        bot.pathfinder.setGoal(null);
        bot.chat('🛑 Actions stopped.');
        break;

      case 'attack':
        const mobName = args[0]?.toLowerCase();
        const entity = bot.nearestEntity(e => e.name === mobName && e.type === 'mob');
        if (!entity) return bot.chat(`No ${mobName} nearby.`);
        bot.chat(`⚔️ Attacking ${mobName}`);
        bot.pvp.attack(entity);
        break;

      case 'mine':
        const blockName = args[0];
        const block = bot.findBlock({ matching: block => block.name === blockName, maxDistance: 32 });
        if (!block) return bot.chat(`No block named ${blockName} found nearby.`);
        bot.chat(`⛏️ Mining ${blockName}...`);
        bot.pathfinder.setGoal(null);
        bot.dig(block).then(() => {
          bot.chat('✅ Done mining');
        }).catch(() => bot.chat('❌ Failed to mine'));
        break;

      case 'enable':
      case 'disable':
        const modName = args[0];
        if (!activeModules[modName]) return bot.chat(`❓ Module ${modName} not found`);
        const enabled = command === 'enable';
        activeModules[modName].enabled = enabled;
        moduleToggles[modName] = enabled;

        const settingsFile = path.join(__dirname, 'settings.json');
        const json = JSON.parse(fs.readFileSync(settingsFile));
        if (json.utils[modName]) {
          json.utils[modName].enabled = enabled;
          fs.writeFileSync(settingsFile, JSON.stringify(json, null, 2));
        }

        bot.chat(`${enabled ? '✅ Enabled' : '🚫 Disabled'} module ${modName}`);
        break;

      case 'status':
        Object.entries(activeModules).forEach(([mod, data]) => {
          bot.chat(`${mod}: ${data.enabled ? '✅' : '❌'}`);
        });
        break;

      default:
        bot.chat(`❔ Unknown command: ${command}`);
        break;
    }
  });
};