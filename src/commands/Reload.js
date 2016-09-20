require("../Globals");

/**
 * Command to reload commands;
 * @extends {command}
 */
class Reload extends Command
{
	constructor()
	{
		super();
		this.admin = true;

		// Helptext values
		this.name         = `reload`;
		this.description  = `Reloads commands to incorporate changes`;
		this.alias        = ``;
		this.usage        = `${settings.prefix}reload`;
		this.help         = ``;
		this.permsissions = [];

		// Activation command regex
		this.command = /^reload$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			this.bot.Say("Reloading commands.".yellow);
			let start = now();
			this.bot.LoadCommands();
			message.channel.sendCode("css", `Commands reloaded. (${(now() - start).toFixed(4)}ms)`)
				.then(message =>
				{
					message.delete(3 * 1000);
				});
		}
	}
}

module.exports = Reload;
