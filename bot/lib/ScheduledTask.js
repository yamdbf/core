/**
 * Wraps a method than when registered with a Scheduler will be return
 * at the interval in seconds provided at initialization.
 */
class ScheduledTask
{
	/**
	 * @param {int} interval A number in seconds, determines how often
	 *                       a task will be performed
	 * @param {method} task The task that will be performed. The task will
	 *                      be passed a Bot instance, a resolve and a reject
	 *                      object. Be sure to receive them.
	 */
	constructor(interval, task)
	{
		this.interval = interval;
		this.task = task;
	}

	/**
	 * Assign the Bot instance to the task and register the task as an
	 * an async process using a Promise
	 * @param {Bot} bot Discord.js Client instance
	 * @returns {null}
	 */
	Register(bot)
	{
		this.bot = bot;
		this.async = new Promise( (resolve, reject) =>
		{
			setInterval(() =>
			{
				this.task(this.bot, resolve, reject);
			}, this.interval * 1000);
		});

		this.async.then( (result) =>
		{
			this.bot.Say(result);
		}, (err) =>
		{
			this.bot.Say(err.stack ? err.stack.red : err.red);
		});
	}
}

module.exports = ScheduledTask;
