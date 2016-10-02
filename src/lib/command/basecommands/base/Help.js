'use babel';
'use strict';

import Command from '../../Command';
import { padRight } from '../../../Util';
import { stripIndent } from 'common-tags';

// Command class to extend to create commands users can execute
export default class Help extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'help',
			description: 'Provides information on bot commands',
			usage: `<prefix>help`,
			group: 'base',
			command: /^help(?: (.+))?$/
		});
	}

	async action(message, args)
	{
		let settings = this.bot.settings;
		if (!settings.selfbot) message.reply(`Sent you a DM with help information.`);
		if (settings.selfbot) message.delete();
		let output = '';
		if (!args[0])
		{
			output += `**These are the commands available to you in the channel you requested help:**\n`;
			output += `\`\`\`ldif\n`;
			let widest = Array.from(this.bot.commands).map(c => c[1].name.length)
				.reduce((a, b) => Math.max(a, b));
			this.bot.commands.forEach(command =>
			{
				output += `${padRight(command.name, widest + 1)}: ${command.description}\n`;
			});
			output += `\`\`\`**Use "<prefix>help <command>" or "${this.bot.user} help <command>" for more information.**`;
		}
		else
		{
			output += `${args[0]} is a cool argument.`;
		}
		output = output.replace(/<prefix>/g, this.bot.getPrefix(message.guild));

		if (settings.selfbot)
		{
			message.channel.sendMessage(output).catch(console.log);
		}
		else
		{
			message.author.sendMessage(output).catch(console.log);
		}
	}
}
