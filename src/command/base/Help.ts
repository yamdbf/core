import { Collection, RichEmbed } from 'discord.js';
import { LangResourceFunction } from '../../types/LangResourceFunction';
import { LocalizedCommandInfo } from '../../types/LocalizedCommandInfo';
import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { Util } from '../../util/Util';
import { localizable } from '../CommandDecorators';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'help',
			desc: 'Provides information on bot commands',
			usage: `<prefix>help [command]`,
			info: 'Will DM bot command help information to the user to keep clutter down in guild channels'
		});
	}

	@localizable
	public async action(message: Message, [lang, commandName]: [string, string]): Promise<void>
	{
		if (this.client.selfbot) message.delete();
		const dm: boolean = message.channel.type !== 'text';
		const mentionName: string = `@${this.client.user.tag}`;

		const cInfo: (command: Command) => LocalizedCommandInfo =
			(command: Command) => Lang.getCommandInfo(command, lang);

		let command: Command;
		let output: string = '';
		let embed: RichEmbed = new RichEmbed();

		if (!commandName)
		{
			const preText: string = `Available commands: (Commands marked with \`*\` are server-only)\n\`\`\`ldif\n`;
			const postText: string = `\`\`\`Use \`<prefix>help <command>\` ${this.client.selfbot ? '' : `or \`${
				mentionName} help <command>\` `}for more info\n\n`;

			const usableCommands: Collection<string, Command> = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.filter(c => !c.hidden);

			const widest: number = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			let commandList: string = usableCommands.map(c =>
				`${Util.padRight(c.name, widest + 1)}${c.guildOnly ? '*' : ' '}: ${cInfo(c).desc}`).sort().join('\n');

			output = preText + commandList + postText;
			if (output.length >= 1024)
			{
				commandList = '';
				let mappedCommands: string[] = usableCommands
					.sort((a, b) => a.name < b.name ? -1 : 1)
					.map(c => (c.guildOnly ? '*' : ' ') + Util.padRight(c.name, widest + 2));

				for (let i: number = 0; i < mappedCommands.length; i++)
				{
					commandList += mappedCommands[i];
					if ((i + 1) % 3 === 0) commandList += '\n';
				}
				output = preText + commandList + postText;
			}
		}
		else
		{
			command = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.find(c => c.name === commandName || c.aliases.includes(commandName));

			if (!command) output = `A command by that name could not be found or you do\n`
				+ `not have permission to view it.`;

			const info: LocalizedCommandInfo = cInfo(command);
			const res: LangResourceFunction = Lang.createResourceLoader(lang);
			if (command) output = res('CMD_HELP_CODEBLOCK', {
				serverOnly: command.guildOnly ? res('CMD_HELP_SERVERONLY') : '',
				ownerOnly: command.ownerOnly ? res('CMD_HELP_OWNERONLY') : '',
				commandName: command.name,
				desc: info.desc,
				aliasText: command.aliases.length > 0 ?
					res('CMD_HELP_ALIASES', { aliases: command.aliases.join(', ')})
					: '',
				usage: info.usage,
				info: info.info ? `\n${info.info}` : ''
			});
		}

		output = dm ? output.replace(/<prefix>/g, '')
			: output.replace(/<prefix>/g, await this.client.getPrefix(message.guild) || '');

		embed.setColor(11854048).setDescription(output);

		let outMessage: Message;
		try
		{
			if (this.client.selfbot) outMessage = <Message> await message.channel.send({ embed });
			else await message.author.send({ embed });
			if (!dm && !this.client.selfbot)
			{
				if (command) message.reply(`Sent you a DM with command help information.`);
				else message.reply(`Sent you a DM with a list of commands.`);
			}
		}
		catch (err)
		{
			if (!dm && !this.client.selfbot)
				message.reply('Failed to DM help information. Do you have DMs blocked?');
		}

		if (outMessage) outMessage.delete(30e3);
	}
}
