import { Bot } from '../../bot/Bot';
import { Message } from '../../types/Message';
import { Util } from '../../Util';
import { Command } from '../Command';
import { Collection, RichEmbed } from 'discord.js';

export default class Help extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'help',
			description: 'Provides information on bot commands',
			usage: `<prefix>help [command]`,
			extraHelp: 'Will DM bot command help information to the user to keep clutter down in guild channels. If you use the help command from within a DM you will only receive information for the commands you can use within the DM. If you want help with commands usable in a guild, call the help command in a guild channel. You will receive a list of the commands that you have permissions/roles for in that channel.',
			group: 'base'
		});
	}

	public async action(message: Message, [commandName]: [string]): Promise<void>
	{
		if (this.bot.selfbot) message.delete();
		const dm: boolean = ['dm', 'group'].includes(message.channel.type);
		const mentionName: string = `@${this.bot.user.username}#${this.bot.user.discriminator}`;

		let command: Command<Bot>;
		let output: string = '';
		let embed: RichEmbed = new RichEmbed();

		if (!commandName)
		{
			const preText: string = `Available commands in ${dm ? 'this DM' : message.channel}\n\`\`\`ldif\n`;
			const postText: string = `\`\`\`Use \`<prefix>help <command>\` ${this.bot.selfbot ? '' : `or \`${
				mentionName} help <command>\` `}for more information.\n\n`;

			const usableCommands: Collection<string, Command<Bot>> = this.bot.commands[dm
				? 'filterDMUsable' : 'filterGuildUsable'](this.bot, message)
				.filter(c => !c.hidden);

			const widest: number = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			let commandList: string = usableCommands.map(c =>
				`${Util.padRight(c.name, widest + 1)}: ${c.description}`).sort().join('\n');

			output = preText + commandList + postText;
			if (output.length >= 1024)
			{
				commandList = '';
				let mappedCommands: string[] = usableCommands.map(c => Util.padRight(c.name, widest + 2)).sort();
				for (let i: number = 0; i <= mappedCommands.length; i++)
				{
					commandList += mappedCommands[i];
					if ((i + 1) % 3 === 0) commandList += '\n';
				}
				output = preText + commandList + postText;
			}
		}
		else
		{
			command = this.bot.commands[dm
				? 'filterDMUsable' : 'filterGuildUsable'](this.bot, message)
				.filter(c => c.name === commandName || c.aliases.includes(commandName))
				.first();

			if (!command) output = `A command by that name could not be found or you do\n`
				+ `not have permissions to view it in this guild or channel`;
			else output = '```ldif\n'
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

		let outMessage: Message;
		if (!dm && !this.bot.selfbot && command) message.reply(`Sent you a DM with command help information.`);
		if (!dm && !this.bot.selfbot && !command) message.reply(`Sent you a DM with a list of commands.`);
		if (this.bot.selfbot) outMessage = <Message> await message.channel.sendEmbed(embed);
		else message.author.sendEmbed(embed);

		if (outMessage) outMessage.delete(30e3);
	}
}
