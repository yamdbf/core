/**
 * Wraps a method than when registered with a Scheduler will be return
 * at the interval in seconds provided at initialization.
 */
class ScheduledTask
{
	/**
	 * @property {int} interval A number in seconds, determines how often
	 *                       a task will be performed
	 * @property {method} task The task that will be performed. The task will
	 *                      be passed a Bot instance, a resolve and a reject
	 *                      object. Be sure to receive them.
	 */
	constructor()
	{
		this.interval = undefined;
		this.task     = undefined;
	}

	/**
	 * Assign the Bot instance to the task and register the task as an
	 * an async process using a Promise
	 * @param {Bot} bot Discord.js Client instance
	 * @returns {null}
	 */
	Register(bot)
	{
		// Assert valid ScheduledTask properties
		let name = this.constructor.name;
		assert(this.interval, `SheduledTask#${name}.command: expected integer, got: ${typeof this.interval}`);
		// assert(Number.isInteger(this.interval), `SheduledTask#${name}.command: expected integer, got: ${typeof this.interval}`);
		assert(this.task, `SheduledTask#${name}.task: expected function, got: ${typeof this.task}`);
		assert(this.task instanceof Function, `SheduledTask#${name}.task: expected function, got: ${typeof this.task}`);

		this.bot = bot;

		this.async = new Promise( (resolve, reject) =>
		{
			setInterval(() =>
			{
				this.task(this.bot, resolve, reject);
			}, this.interval * 1000 * 60);
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
