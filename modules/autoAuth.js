module.exports = (bot) => {
  const password = require('../settings.json').utils['auto_auth'].password;

  if (!password) {return}
  
  bot.once('spawn', () => {
    setTimeout(() => {
      bot.chat(`/register ${password} ${password}`);
      bot.chat(`/reg ${password} ${password}`);
      bot.chat(`/login ${password}`);
      bot.chat('/l ' + password);
      console.log(`[🔐 AutoAuth] Sent register/login commands`);
    }, 1000);
  });
};