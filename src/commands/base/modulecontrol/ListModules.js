require(Globals);

/**
 * Command to list all Command modules
 * @extends {command}
 */
class ListModules extends Command
{
	constructor()
	{
		super();
		this.admin = true;

		// Helptext values
		this.name         = `listmodules`;
		this.description  = `List all Command modules`;
		this.alias        = `modules`;
		this.usage        = `${settings.prefix}listmodules`;
		this.help         = `Will list enabled and disabled modules. Disabled modules are denoted by a "*".`;
		this.permsissions = [];

		// Activation command regex
		this.command = /^(?:modules|listmodules)$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			let modules = GetDirs("./src/commands/");

			try
			{
				var disabledModules = this.bot.db.getData("/disabledModules");
			}
			catch (e)
			{
				this.bot.db.push("/disabledModules", [], true);
				var disabledModules = this.bot.db.getData("/disabledModules");
			}

			let output = "Current Command modules:\n";
			modules.forEach( (m) =>
			{
				output += `${disabledModules.includes(m) ? "*" : ""}${m}\n`;
			});
			output += `\nUse ${settings.prefix}disable <module> or ${settings.prefix}enable <module> to enable or disable a module.`;

			message.channel.sendCode("css", output)
				.then(message => { message.delete(10 * 1000) });
		}
	}
}

module.exports = ListModules;
