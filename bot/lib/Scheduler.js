/**
 * An Array wrapper that handles registering ScheduledTask tasks and
 * passing the bot instance to them
 * @extends {Array}
 */
class Scheduler extends Array
{
	/**
	 * @param {Bot} bot Discord.js Client instance
	 */
	constructor(bot)
	{
		super();
		this.bot = bot;
	}

	/**
	 * Register the ScheduledTask, pass the Bot instance and add it to
	 * the parrent Array
	 * @param {ScheduledTask} task Task to be scheduled
	 * @returns {null}
	 */
	Schedule(task)
	{
		task.Register(this.bot);
		this.push(task);
	}
}

module.exports = Scheduler;
