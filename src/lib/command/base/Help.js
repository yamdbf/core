'use babel';
'use strict';

import Command from '../Command';
import { padRight } from '../../Util';
import { RichEmbed } from 'discord.js';

export default class Help extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'help',
			description: 'Provides information on bot commands',
			aliases: [],
			usage: `<prefix>help [command]`,
			extraHelp: 'Will DM bot command help information to the user to keep clutter down in guild channels. If you use the help command from within a DM you will only receive information for the commands you can use within the DM. If you want help with commands usable in a guild, call the help command in a guild channel. You will receive a list of the commands that you have permissions/roles for in that channel.',
			group: 'base'
		});
	}

	async action(message, args)
	{
		if (this.bot.selfbot) message.delete();
		const dm = message.channel.type === 'dm' || message.channel.type === 'group';
		const mentionName = `@${this.bot.user.username}#${this.bot.user.discriminator}`;

		let command;
		let output = '';
		let embed = new RichEmbed();

		if (!args[0])
		{
			output += `Available commands in ${dm ? 'this DM' : message.channel}\n\`\`\`ldif\n`;
			const usableCommands = this.bot.commands[dm
				? 'filterDMUsable' : 'filterGuildUsable'](this.bot, message)
				.filter(c => !c.hidden);

			const widest = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			output += usableCommands.map(c =>
				`${padRight(c.name, widest + 1)}: ${c.description}`).sort().join('\n');

			output += `\`\`\`Use \`<prefix>help <command>\` ${this.bot.selfbot ? '' : `or \`${
				mentionName} help <command>\` `}for more information.\n\n`;
		}
		else
		{
			command = this.bot.commands[dm
				? 'filterDMUsable' : 'filterGuildUsable'](this.bot, message)
				.filter(c => c.name === args[0] || c.aliases.includes(args[0]))
				.first();

			if (!command) output = `A command by that name could not be found or you do\n`
				+ `not have permissions to view it in this guild or channel`;
			else output = '```ldif\n' // eslint-disable-line prefer-template
				+ `Command: ${command.name}\n`
				+ `Description: ${command.description}\n`
				+ (command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}\n` : '')
				+ `Usage: ${command.usage}\n`
				+ (command.extraHelp ? `\n${command.extraHelp}` : '')
				+ '\n```';
		}

		output = dm ? output.replace(/<prefix>/g, '')
			: output.replace(/<prefix>/g, this.bot.getPrefix(message.guild) || '');

		embed.setColor(11854048).setDescription(output);

		let outMessage;
		if (!dm && !this.bot.selfbot && command) message.reply(`Sent you a DM with command help information.`);
		if (!dm && !this.bot.selfbot && !command) message.reply(`Sent you a DM with a list of commands.`);
		if (this.bot.selfbot) outMessage = await message.channel.sendEmbed(embed);
		else message.author.sendEmbed(embed);

		if (outMessage) outMessage.delete(30e3);
	}
}
