module.exports = (bot) => {
  const taskQueue = [];
  let isRunning = false;

  function runNextTask() {
    if (isRunning || taskQueue.length === 0) return;

    const nextTask = taskQueue.shift();
    if (nextTask && typeof nextTask === 'function') {
      isRunning = true;
      nextTask(() => {
        isRunning = false;
        runNextTask();
      });
    }
  }

  function addTask(taskFn) {
    taskQueue.push(taskFn);
    runNextTask();
  }

  function clearTasks() {
    taskQueue.length = 0;
    isRunning = false;
    bot.clearControlStates?.();
    bot.pathfinder.setGoal(null);
    bot.chat('🧹 Cleared task queue.');
  }

  bot.taskManager = {
    add: addTask,
    clear: clearTasks,
    status: () => ({
      isRunning,
      queueLength: taskQueue.length
    })
  };

  bot.on('chat', (username, message) => {
    if (!message.startsWith('.task')) return;

    const cmd = message.split(' ')[1];
    switch (cmd) {
      case 'status':
        const s = bot.taskManager.status();
        bot.chat(`📊 Tasks: ${s.queueLength} in queue, running: ${s.isRunning}`);
        break;
      case 'clear':
        bot.taskManager.clear();
        break;
    }
  });
};
