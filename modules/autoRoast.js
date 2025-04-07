const roasts = [
  "You're the reason the gene pool needs a lifeguard.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  "You have something on your chin... no, the third one down.",
  "You're not stupid; you just have bad luck thinking.",
  "If I had a dollar for every time you said something smart, I’d be broke."
];

module.exports = (bot, config) => {
  if (!config.utils.anti_afk.enabled) return;

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (username === 'ClearLag') return;
    if (Math.random() < 0.05) { // 50% chance to roast
      const burn = roasts[Math.floor(Math.random() * roasts.length)];
      bot.chat(`${username}, ${burn}`);
      console.log(`[🔥 AutoRoast] Roasted ${username}: ${burn}`);
    }
  });

  console.log('[🔥 AutoRoast] Roasting mode enabled');
};