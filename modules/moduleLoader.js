const fs = require('fs');
const path = require('path');
const settings = require('./settings.json');

function loadModules(bot) {
  const modulesPath = path.join(__dirname, 'modules');
  if (!fs.existsSync(modulesPath)) {
    console.warn('[ModuleLoader] ⚠️ Modules folder not found.');
    return;
  }

  const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
  const enabledModules = settings.modules || {};

  for (const file of moduleFiles) {
    const moduleName = file.replace('.js', '');
    const modulePath = path.join(modulesPath, file);

    if (enabledModules[moduleName]) {
      try {
        const plugin = require(modulePath);
        plugin(bot);
        console.log(`✅ [ModuleLoader] Loaded: ${moduleName}`);
      } catch (err) {
        console.error(`❌ [ModuleLoader] Failed to load ${moduleName}:`, err.message);
      }
    } else {
      console.log(`⛔ [ModuleLoader] Skipped (disabled): ${moduleName}`);
    }
  }
}

module.exports = loadModules;