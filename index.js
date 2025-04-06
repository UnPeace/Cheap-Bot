// index.js
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');
const express = require('express');
const chalk = require('chalk');
const config = require('./settings.json');

// Load optional modules
const modules = config.utils.modules || {};

// Express Server
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(8000, () => console.log(chalk.green('[Web] 🌐 Express server started on port 8000')));

function createBot() {
  const bot = mineflayer.createBot({
    username: config['bot-account'].username,
    password: config['bot-account'].password,
    auth: config['bot-account'].type,
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version
  });

  bot.loadPlugin(pathfinder);
  const mcData = require('minecraft-data')(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.settings.colorsEnabled = false;

  bot.once('spawn', () => {
    console.log(chalk.yellow('[AfkBot] 🤖 Bot joined the server'));

    if (config.utils['auto-auth'].enabled) {
      console.log(chalk.cyan('[Auth] 🔐 Auto-auth module enabled'));
      const password = config.utils['auto-auth'].password;
      setTimeout(() => {
        bot.chat(`/register ${password} ${password}`);
        bot.chat(`/login ${password}`);
      }, 500);
    }

    if (config.utils['chat-messages'].enabled) {
      console.log(chalk.cyan('[Chat] 💬 Chat-messages module enabled'));
      const messages = config.utils['chat-messages'].messages;
      if (config.utils['chat-messages'].repeat) {
        let i = 0;
        setInterval(() => {
          bot.chat(messages[i]);
          i = (i + 1) % messages.length;
        }, config.utils['chat-messages']['repeat-delay'] * 1000);
      } else {
        messages.forEach(msg => bot.chat(msg));
      }
    }

    const pos = config.position;
    if (pos.enabled) {
      console.log(chalk.green(`[Move] 🧭 Moving to target location (${pos.x}, ${pos.y}, ${pos.z})`));
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
    }

    if (config.utils['anti-afk'].enabled) {
      console.log(chalk.blue('[AFK] 💤 Anti-AFK enabled'));
      bot.setControlState('jump', true);
      if (config.utils['anti-afk'].sneak) bot.setControlState('sneak', true);
    }

    // 🔌 Dynamic Modules
    if (modules['chat-commands']) require('./commands/chatCommands')(bot, config);
    if (modules['auto-roast']) require('./modules/autoRoast')(bot);
    if (modules['random-afk-behavior']) require('./modules/randomAfk')(bot);
    if (modules['anti-stuck']) require('./modules/antiStuck')(bot);
    if (modules['combat-logger']) require('./modules/combatLogger')(bot);
    if (modules['inventory-manager']) require('./modules/inventoryManager')(bot);
    if (modules['discord-webhook']) require('./modules/webhook')(bot);
  });

  bot.on('chat', (username, message) => {
    if (config.utils['chat-log']) {
      console.log(chalk.gray(`[ChatLog] <${username}> ${message}`));
    }
  });

  bot.on('goal_reached', () => {
    console.log(chalk.green(`[Move] ✅ Arrived at location: ${bot.entity.position}`));
  });

  bot.on('death', () => {
    console.log(chalk.red(`[Death] 💀 Bot died and respawned at ${bot.entity.position}`));
  });

  if (config.utils['auto-reconnect']) {
    bot.on('end', () => {
      console.log(chalk.yellow('[Reconnect] 🔄 Bot disconnected. Reconnecting...'));
      setTimeout(createBot, config.utils['auto-recconect-delay']);
    });
  }

  bot.on('kicked', reason => {
    console.log(chalk.red(`[Kicked] ❌ Bot was kicked. Reason:
${reason}`));
  });

  bot.on('error', err => {
    console.log(chalk.bgRed.white('[ERROR] ⚠️ ' + err.message));
  });
}

createBot();
