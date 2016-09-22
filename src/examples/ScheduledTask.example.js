require(Globals);

/**
 * Description
 * @extends {ScheduledTask}
 */
class TaskName extends ScheduledTask
{
	constructor(interval)
	{
		super();

		// Interval is to be an integer in minutes
		this.interval = 1;

		/**
		 * Task to be performed at the scheduled interval
		 * @param  {Bot} bot Discord.js Client instance
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.task = (bot, resolve, reject) =>
		{
			console.log("foo");
		}
	}
}

module.exports = TaskName;
