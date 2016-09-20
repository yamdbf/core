require("../Globals");

/**
 * Admin command to restart the bot. Updates will be pulled
 * from the repo if available (assuming launched from run.sh)
 * @extends {command}
 */
class Restart extends Command
{
	constructor()
	{
		super();
		this.admin = true;

		// Helptext values
		this.name         = `restart`;
		this.description  = `Restarts the bot`;
		this.alias        = ``;
		this.usage        = `${settings.prefix}restart`;
		this.help         = `Updates will be pulled from the repo if the bot is launched via run.sh, as it should.`;
		this.permsissions = [];

		// Activation command regex
		this.command = /^restart$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			this.bot.Say("Restarting...".yellow);

			this.bot.db.push("/doRestart", true);
			this.bot.db.push("/restartID", message.channel.id);
			this.bot.db.push("/restartTime", Time.now());

			process.exit();
		}
	}
}

module.exports = Restart;
