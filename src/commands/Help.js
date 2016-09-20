require("../Globals");

/**
 * Command to list available commands or print helptext
 * for the given command
 * @extends {command}
 */
class Help extends Command
{
	constructor()
	{
		super();

		// Helptext values
		this.name        = `help`;
		this.description = `Provides the user with a list of commands and what they do`;
		this.alias       = ``;
		this.usage       = `\n\t${settings.prefix}help\n\t${settings.prefix}help <command>`;
		this.help        = `${settings.prefix}help will list available commands.
${settings.prefix}help <command> will print the helptext for the given command.`;
		this.permissions = [];

		// Activation command regex
		this.command = /^help(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{
			let command = message.content.match(this.command)[1];

			// List all commands
			if (!command)
			{
				// Get command names and sort alphabetically
				var commands = Object.keys(this.bot.commands.info);
				commands.sort();

				// Find widest command name for list padding
				let maxWidth = 0;
				commands.forEach( (key) =>
				{
					if (key.length > maxWidth) maxWidth = key.length;
				});

				// Build helptext
				let helptext = "```xl\nAvailable commands:\n"
				commands.forEach( (key) =>
				{
					let cmd = this.bot.commands.info[key];
					if (!cmd.admin)
						helptext += `${Pad(key, maxWidth + 1)}: ${cmd.description}\n`;
				});
				helptext += `\nUse "${settings.prefix}help <command>" for more command information.` + "\n```"

				// Send helptext, delete after 20 secs
				message.channel.sendMessage(helptext).then(message =>
				{
					message.delete(20 * 1000);
				});
			}
			else
			{
				let cmd = this.bot.commands.info[command.toLowerCase()];

				// Send helptext, delete after 20 secs
				message.channel.sendMessage(
					`\`\`\`xl\nDescription: ${cmd.description}` +
					`${cmd.permissions.length > 0 ? "\nPermissions: " + cmd.permissions.join(", ") : ""}` +
					`${cmd.alias ? "\nAlias: " + cmd.alias : ""}` +
					`\nUsage: ${cmd.usage}\n\n${cmd.help}\n\`\`\``)
						.then(message =>
						{
							message.delete(20 * 1000);
						});
			}
		}
	}
}

module.exports = Help;
