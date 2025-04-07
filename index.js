const mineflayer = require('mineflayer');
const Movements = require('mineflayer-pathfinder').Movements;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const config = require('./settings.json');
const fs = require('fs');
const path = require('path')
const config2 = JSON.parse(fs.readFileSync("settings.json"))
const chalk = require('chalk');
const express = require('express');
const app = express();

const bot = mineflayer.createBot({
   username: config['bot_account']['username'],
   password: config['bot_account']['password'],
   auth: config['bot_account']['type'],
   host: config.server.ip,
   port: config.server.port,
   version: config.server.version,
});


// Load Modules List


const autoAuth = require('./modules/autoAuth')(bot);
const antiAfk = require('./modules/antiAfk')(bot);
const pathfinderMove = require('./modules/pathfinderMove')(bot);
const chatLog = require('./modules/chatLog')(bot);
const autoReconnect = require('./modules/autoReconnect')(bot);
const autoRoast = require('./modules/autoRoast')(bot, config);
const randomAfk = require('./modules/randomAfk')(bot);
console.log();
const combatLogger = require('./modules/combatLogger')(bot);
const inventoryManager = require('./modules/inventoryManager')(bot);
const taskManager = require('./modules/taskManager')(bot);
const autoFish = require('./modules/autoFish')(bot);
const autoMine = require('./modules/autoMine')(bot);
const autoFarm = require('./modules/autoFarm')(bot);
const chatGuard = require('./modules/chatGuard')(bot);
const movementUtils = require('./modules/movementUtils')(bot)

// End of Loaded modules list








app.get('/', (req, res) => {
  res.send('Bot is arrived');
});

app.listen(8000, () => {
  console.log(chalk.green(' || ---> Server started on port 8000 <-- || '));
});

function createBot() {
   
   
   
   // bot.settings is defined
   bot.settings = bot.settings || {};
   bot.settings.colorsEnabled = bot.settings.colorsEnabled !== undefined ? bot.settings.colorsEnabled : false;

   bot.loadPlugin(pathfinder);
   const mcData = require('minecraft-data')(bot.version);
   const defaultMove = new Movements(bot, mcData);

   bot.once('spawn', () => {
      console.log(chalk.yellow('[AfkBot] Bot joined to the server'));

      if (config.utils['auto_auth'].enabled) {
         console.log(chalk.blue('[INFO] Started auto-auth module'));

         const password = config.utils['auto_auth'].password;
         setTimeout(() => {
            bot.chat(`/register ${password} ${password}`);
            bot.chat(`/login ${password}`);
         }, 500);

         console.log(chalk.green('[Auth] Authentication commands executed.'));
      }

      if (config.utils['chat_messages'].enabled) {
         console.log(chalk.blue('[INFO] Started chat-messages module'));
         const messages = config.utils['chat_messages'].messages;

         if (config.utils['chat_messages'].repeat) {
            const delay = config.utils['chat_messages']['repeat_delay'];
            let i = 0;

            let msg_timer = setInterval(() => {
               bot.chat(messages[i]);

               if (i + 1 === messages.length) {
                  i = 0;
               } else i++;
            }, delay * 1000);
         } else {
            messages.forEach((msg) => {
               bot.chat(msg);
            });
         }
      }

      const pos = config.position;

      if (config.position.enabled) {
         console.log(
            chalk.green(`[AfkBot] Starting moving to target location (${pos.x}, ${pos.y}, ${pos.z})`)
         );
         bot.pathfinder.setMovements(defaultMove);
         bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z));
      }

      if (config.utils['anti_afk'].enabled) {
         bot.setControlState('jump', true);
         if (config.utils['anti_afk'].sneak) {
            bot.setControlState('sneak', true);
         }
      }
   });

   bot.on('chat', (username, message) => {
      if (config.utils['chat_log']) {
         console.log(chalk.magenta(`[ChatLog] <${username}> ${message}`));
      }
   });

   bot.on('goal_reached', () => {
      console.log(
         chalk.green(`[AfkBot] Bot arrived at target location: ${bot.entity.position}`)
      );
   });

   bot.on('death', () => {
      console.log(
         chalk.yellow(`[AfkBot] Bot has died and respawned at ${bot.entity.position}`)
      );
   });

   if (config.utils['auto_reconnect']) {
      bot.on('end', () => {
         setTimeout(() => {
            createBot();
         }, config.utils['auto_recconect_delay']);
      });
   }

   bot.on('kicked', (reason) =>
      console.log(chalk.red(`[AfkBot] Bot was kicked from the server. Reason: \n${reason}`))
   );
   bot.on('error', (err) =>
      console.log(chalk.red(`[ERROR] ${err.message}`))
   );
}

createBot();
