# 🧠 Ultimate God-Tier Minecraft Bot (AFK + Auto Everything)

Welcome to the *final evolution* of Minecraft bots — your very own **autonomous, chat-controllable, godlike AFK overlord**. This modular bot does it all: builds bases, farms resources, smacks mobs, trades, and even fights like a cracked PvP champion. You don't play Minecraft anymore — you *command* it.

---

## ⚙️ Features & Modules

All modules can be toggled via:
- `settings.json`
- In-game chat commands (like `.module enable autofish`)
- Web-based GUI on port `8000`

### 🧼 Core Utils

| Module         | Description |
|----------------|-------------|
| `auto-auth`    | Automatically handles `/register` and `/login`. |
| `anti-afk`     | Prevents the bot from being kicked (random jumps, sneaks, movement). |
| `chat-log`     | Logs all in-game chat to the terminal. |
| `chat-messages`| Repeatedly sends configured chat messages. |
| `auto-reconnect`| Rejoins after disconnect with optional delay. |

---

### 💬 In-Game Chat Commands

Commands are prefixed with `.`, examples:

| Command | Description |
|---------|-------------|
| `.follow <player>` | Follows a player around. |
| `.mv stop` | Stops Movement Utils. |
| `.guard` | Will Guard the player with all his might|
| `.mine <block>` | Starts mining that block type forever. |
| `.fish` | Begins automatic fishing. |
| `.cook` | Auto smelts items in nearby furnace. |
| `.farm` | Auto-harvests and replants crops. |
| `.foodhunt` | Searches for animals and hunts for food. |
| `.bed` | Finds and sleeps in nearest bed. |
| `.killhostiles` | Kills all nearby hostile mobs. |
| `.pvpmode` | Starts PvP training/fighting mode (god-tier AI). |
| `.build <schematic>` | Starts building the specified schematic. |
| `.stopbuild` | Stops building. |
| `.inventory` | Lists inventory items in chat. |
| `.trade` | Auto-trades with nearby villagers. |

---

## 🛠️ Advanced Modules

### 🪓 `automine`
- Mines specified block type repeatedly.
- Resumes after broken pickaxe (if autoEquip enabled).

### 🎣 `autofish`
- Finds water and fishes endlessly.
- Swaps rods if one breaks.

### 🔥 `autocook`
- Uses furnace to smelt ores/food.

### 🌾 `autofarm`
- Harvests wheat, carrots, potatoes, etc.
- Replants intelligently.

### 🥩 `foodhunt`
- Finds animals nearby and hunts until food stock is full.

### 😈 `autofight`
- Detects hostile mobs and fights automatically.
- Blocks, attacks, dodges, and heals like a real player.

### 🛏️ `bedfinder`
- Searches for beds at night and sleeps.

### 💬 `chatCommands`
- Your full control center. Add any command via chat.

### 💪 `pvpPractice`
- Enables aggressive, self-healing PvP AI.
- Auto eats, equips, fights, and uses terrain.

### 🏗️ `autoBuild`
- Supports WorldEdit `.schematic` and Litematica `.litematic`.
- Smart build placement to avoid cliffs/lava.
- Includes mini iron farm schematic built-in.

### 🧰 `inventoryManager`
- Auto equips best gear.
- Organizes and drops trash.
- Repairs tools with mending or anvils.

### 🔧 `autoRepair`
- Uses XP (mending) or nearby anvil.
- Tracks item durability and switches tools smartly.

### 🧙 `autoTrade`
- Finds villagers, auto-trades based on config.
- Prioritizes emeralds and enchanted gear.

---

## 🌐 Web GUI (Port `8000`) [Coming soon!]

- Toggle modules on/off from browser.
- View bot logs and statuses.
- More features coming soon...

---

## 📦 Setup Instructions

1. `npm install`  
2. Edit `settings.json`  
3. `node index.js`


---

## 👀 Coming Soon

- Map exploration and auto waypoints
- Discord remote control
- In-game GUI with `chest` menus

---

## 👑 Author

Built with passion, sarcasm, and 1.12.2 autism ❤️  
If you're reading this far, you're now legally the bot’s sidekick.

---

**License**: MIT (Modular Intelligence Terms)