require(Globals);

/**
 * Reloads commands, preventing the specified Command
 * module folder from being loaded.
 * @extends {command}
 */
class DisableModule extends Command
{
	constructor()
	{
		super();
		this.admin = true;

		// Helptext values
		this.name         = `disablemodule`;
		this.description  = `Disables a Command module`;
		this.alias        = `disable`;
		this.usage        = `${settings.prefix}disablemodule <module>`;
		this.help         = `Reloads commands, preventing the specified Command module folder from being loaded.`;
		this.permsissions = [];

		// Activation command regex
		this.command = /^(?:disable|disablemodule)(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			let cmdModule = message.content.match(this.command)[1];
			if (!cmdModule)
			{
				message.channel.sendCode("css", "You must provide a module to disable.")
					.then(message => { message.delete(3 * 1000) });
				return;
			}

			// Don't break required modules, break
			if (cmdModule == "base")
			{
				message.channel.sendCode("css", "You cannot disable that module.")
					.then(message => { message.delete(3 * 1000) });
				return;
			}

			// Get all Command modules
			let dirs = GetDirs("./src/commands");

			// Module does not exist, break
			if (!dirs.includes(cmdModule))
			{
				message.channel.sendCode("css", `Could not find module "${cmdModule}".`)
					.then(message => { message.delete(3 * 1000) });
				return;
			}

			// Get currently disabled modules
			try
			{
				var disabledModules = this.bot.db.getData("/disabledModules");
			}
			catch (e)
			{
				this.bot.db.push("/disabledModules", [], true);
				var disabledModules = this.bot.db.getData("/disabledModules");
			}

			// Disable the module, break
			if (!disabledModules.includes(cmdModule))
			{
				disabledModules.push(cmdModule)
				this.bot.db.push("/disabledModules", disabledModules, true);
			}

			// Module is already disabled, break
			else
			{
				message.channel.sendCode("css", `Module "${cmdModule}" is already disabled.`)
					.then(message => { message.delete(3 * 1000) });
				return;
			}

			message.channel.sendCode("css", `Disabled module "${cmdModule}"`)
				.then(message => { message.delete(3 * 1000) });

			// Reload commands
			this.bot.Say("Reloading commands.".yellow);
			this.bot.LoadCommands();
		}
	}
}

module.exports = DisableModule;
