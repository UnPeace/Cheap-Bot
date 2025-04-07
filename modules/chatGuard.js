const insults = [
  "You're like a creeper — nobody wants you around.",
  "Did your brain go AFK?",
  "You're not lagging. That's just your IQ processing.",
  "Even a silverfish is more useful.",
  "You type like you're using a stone pickaxe on obsidian."
];

const filters = ['hack', 'cheat', 'noob', 'loser', 'fuck', 'magi', 'madarchod', 'chudi', 'chut', 'chutiye', 'chutiya', 'bhosdike', 'bhosdika', 'bhosdiki', 'bhosdikiya', 'bhosdikiya',]; // Filtered keywords 
const autoReplies = {
  'hello': 'Yo, what’s up?',
  'hi': 'Hey!',
  'who are you': 'I’m your worst nightmare in block form.',
  'bot': 'Yeah, I’m a bot. But I play better than you.'
};

module.exports = (bot) => {
  const config = require('../settings.json').utils.chatGuard;
  if (!(config.enabled)) return;

  const roastBack = config.autoRoast;
  const filterOn = config.enabled;
  const replyOn = config.autoReply;

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    if (filterOn) {
      for (let word of filters) {
        if (message.toLowerCase().includes(word)) {
          bot.chat(`⚠️ ${username}, watch your mouth.`);
          return;
        }
      }
    }

    if (replyOn) {
      for (let trigger in autoReplies) {
        if (message.toLowerCase().includes(trigger)) {
          bot.chat(autoReplies[trigger]);
          return;
        }
      }
    }

    if (roastBack && Math.random() < 0.3) {
      const insult = insults[Math.floor(Math.random() * insults.length)];
      bot.chat(`🔥 ${username} ${insult}`);
    }
  });

  console.log('🛡️ ChatGuard module online. Watching the chat...');
};
