const Vec3 = require('vec3');

module.exports = (bot) => {
  const sneakEnabled = require('../settings.json').utils['anti_afk'].sneak;

  bot.once('spawn', () => {
    console.log(`[🕺 AntiAFK] Activating advanced anti-AFK mode`);

    setInterval(() => {
      // Random look direction
      const yaw = Math.random() * 2 * Math.PI;
      const pitch = (Math.random() - 0.5) * Math.PI / 2;
      bot.look(yaw, pitch, true);

      // Random movement
      const direction = ['forward', 'back', 'left', 'right'];
      const move = direction[Math.floor(Math.random() * direction.length)];
      bot.setControlState(move, true);

      // Random jump
      bot.setControlState('jump', Math.random() > 0.5);

      // Optional sneak
      if (sneakEnabled) bot.setControlState('sneak', Math.random() > 0.5);

      // Stop movement after 1-2 seconds
      setTimeout(() => {
        bot.clearControlStates();
      }, 1000 + Math.random() * 1000);

    }, 5000 + Math.random() * 5000); // Randomize intervals

  });
};
