module.exports = (bot) => {
  const settings = require('../settings.json').utils['chat-messages'];
  const messages = settings.messages;
  const repeat = settings.repeat;
  const delay = settings['repeat-delay'];

  bot.once('spawn', () => {
    if (repeat) {
      let i = 0;
      setInterval(() => {
        if (!bot.player) return;
        bot.chat(messages[i]);
        i = (i + 1) % messages.length;
      }, delay * 1000);
    } else {
      messages.forEach((msg, idx) => {
        setTimeout(() => bot.chat(msg), idx * 1000);
      });
    }

    console.log(`[💬 ChatMessages] Started ${repeat ? 'repeating' : 'one-time'} messages`);
  });
};
