module.exports = (bot) => {
  const enabled = require('../settings.json').utils['chat-log'];

  if (!enabled) return;

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[📨 ChatLog] <${username}> ${message}`);
  });

  console.log('[📨 ChatLog] Chat logging is active');
};
