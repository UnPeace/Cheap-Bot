const settings = require('../settings.json').utils;

module.exports = (bot, createBot) => {
  if (!settings['auto-reconnect']) return;

  bot.on('end', () => {
    console.log(`[🔌 AutoReconnect] Disconnected. Reconnecting in ${settings['auto-recconect-delay']}ms...`);
    setTimeout(() => {
      createBot();
    }, settings['auto-recconect-delay']);
  });

  bot.on('kicked', (reason) => {
    console.log(`[👢 AutoReconnect] Kicked from server: ${reason}`);
  });

  bot.on('error', (err) => {
    console.log(`[❌ AutoReconnect] Error: ${err.message}`);
  });
};
