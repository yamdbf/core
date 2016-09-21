/**
 * Used for initializing ScheduledTasks and storing them
 * for later access
 * @extends {Array}
 */
class Scheduler
{
	/**
	 * @param {Bot} bot Discord.js Client instance
	 */
	constructor(bot)
	{
		this.bot = bot;
		this.tasks = [];
	}

	/**
	 * Register the ScheduledTask, pass the Bot instance and add it to
	 * the parrent Array
	 * @param {ScheduledTask} task Task to be scheduled
	 * @returns {null}
	 */
	Schedule(task, index)
	{
		task.Register(this.bot);
		this.tasks[index] = task;
	}
}

module.exports = Scheduler;
