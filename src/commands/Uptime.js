require("../Globals");

/**
 * Command to see the time since the bot was launched
 * Call with /uptime
 * @extends {command}
 */
class Uptime extends Command
{
	constructor()
	{
		super();

		// Helptext values
		this.name        = `uptime`;
		this.description = `Print the time since the bot was started`;
		this.alias       = ``;
		this.usage       = `${settings.prefix}uptime`;
		this.help        = `The uptime command will print the time since the bot was started to the channel the command was called from.`;
		this.permissions = [];

		// Activation command regex
		this.command = /^uptime$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested uptime.");

			// Use Time.Difference to convert uptime ms into something useable
			let uptime = Time.Difference(this.bot.uptime * 2, this.bot.uptime);

			// Send uptime to channel
			message.channel.sendCode("css", `Uptime: ${uptime.toString()}.`);
		}
	}
}

module.exports = Uptime;
