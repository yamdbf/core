require("../Globals");

/**
 * Admin command to remotely shut down the bot and pull updates.
 * The bot will automatically restart after updating.
 * @extends {command}
 */
class Update extends Command
{
	constructor()
	{
		super();
		this.admin = true;

		// Helptext values
		this.name         = `update`;
		this.description  = `Shuts down the bot to pull updates`;
		this.alias        = ``;
		this.usage        = `${settings.prefix}update`;
		this.help         = `Update command must be sent as a DM. As long as the bot is launched via the run.sh script it will do a git pull and relaunch the bot.`;
		this.permsissions = [];

		// Activation command regex
		this.command = /^update$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested update.");

			// Break if not admin specified in settings.json
			// or if not DM channel
			if (message.author.id != settings.admin ||
				message.channel.type != "dm") return;

			this.bot.Say("Shutting down for updates.");
			message.author.sendCode("css","Shutting down for updates.");

			this.bot.db.push("/doUpdate", true);

			setTimeout(() => { process.exit(1); }, 1000);
		}
	}
}

module.exports = Update;
