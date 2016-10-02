'use babel';
'use strict';

import Command from '../../Command';
import { padRight } from '../../../Util';

// Command class to extend to create commands users can execute
export default class Help extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'help',
			description: 'Provides information on bot commands',
			aliases: ['h'],
			usage: `<prefix>help`,
			extraHelp: 'Will DM bot command help information to the user to keep clutter down in guild channels',
			group: 'base',
			command: /^(?:help|h)(?: (.+))?$/
		});
	}

	async action(message, args)
	{
		let dm = message.channel.type === 'dm';
		let settings = this.bot.settings;
		if (this.bot.selfbot) message.delete();

		let command;
		let output = '';
		if (!args[0] && !dm)
		{
			command = true;
			output += `These are the commands available to you in the channel you requested help:\n\`\`\`ldif\n`;
			let usableCommands = this.bot.commands.commandArray()
				.filterByUsability(this.bot, message);
			let widest = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			output += usableCommands.map(c =>
				`${padRight(c.name, widest + 1)}: ${c.description}`).join('\n');
			output += `\`\`\`Use "<prefix>help <command>" or "${this.bot.user} help <command>" for more information.\n\n`;
		}
		else if (!args[0] && dm)
		{
			command = true;
			output += `These are the commands available to you within this DM:\n\`\`\`ldif\n`;
			let usableCommands = this.bot.commands.commandArray()
				.filter(c => !c.guildOnly && ((this.bot.settings.owner
					.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly));
			let widest = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			output += usableCommands.map(c =>
				`${padRight(c.name, widest + 1)}: ${c.description}`).join('\n');
			output += `\`\`\`Use "<prefix>help <command>" or "${this.bot.user} help <command>" for more information.\n\n`;
		}
		else if (args[0])
		{
			if (!dm)
			{
				command = this.bot.commands.commandArray()
					.filterByUsability(this.bot, message)
					.filter(c => args[0] === c.name)[0];
			}
			else
			{
				command = this.bot.commands.commandArray()
					.filter(c => !c.guildOnly && ((this.bot.settings.owner
						.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly))
					.filter(c => args[0] === c.name)[0];
			}
			if (!command)
			{
				output += `A command by that name could not be found or you do not have permissions to view it in this guild or channel`;
			}
			else
			{
				output += '```ldif\n' // eslint-disable-line prefer-template
					+ `Description: ${command.description}\n`
					+ (command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}\n` : '')
					+ `Usage: ${command.usage}\n`
					+ (command.extraHelp ? `\n${command.extraHelp}` : '')
					+ '\n```';
			}
		}
		output = dm ? output.replace(/<prefix>/g, '')
			: output.replace(/<prefix>/g, this.bot.getPrefix(message.guild));

		if (!dm && !this.bot.selfbot && command) message.reply(`Sent you a DM with help information.`);
		if (!dm && !this.bot.selfbot && !command) message.reply(`Sent you a DM with information.`);
		if (this.bot.selfbot) message.channel.sendMessage(output);
		else message.author.sendMessage(output);
	}
}
