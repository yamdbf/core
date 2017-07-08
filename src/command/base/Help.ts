import { Collection, RichEmbed } from 'discord.js';
import { LocalizedCommandInfo } from '../../types/LocalizedCommandInfo';
import { ResourceLoader } from '../../types/ResourceLoader';
import { TemplateData } from '../../types/TemplateData';
import { Message } from '../../types/Message';
import { localizable } from '../CommandDecorators';
import { Lang } from '../../localization/Lang';
import { Util } from '../../util/Util';
import { Command } from '../Command';

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
	public async action(message: Message, [res, commandName]: [ResourceLoader, string]): Promise<void>
	{
		if (this.client.selfbot) message.delete();
		const dm: boolean = message.channel.type !== 'text';
		const mentionName: string = `@${this.client.user.tag} `;
		const lang: string = dm ? this.client.defaultLang
			:  await message.guild.storage.settings.get('lang');

		const cInfo: (cmd: Command) => LocalizedCommandInfo =
			(cmd: Command) => Lang.getCommandInfo(cmd, lang);

		let command: Command;
		let output: string = '';
		let embed: RichEmbed = new RichEmbed();

		if (!commandName)
		{
			const usableCommands: Collection<string, Command> = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.filter(c => !c.hidden);

			const widest: number = usableCommands
				.map(c => c.name.length)
				.reduce((a, b) => Math.max(a, b));

			let commandList: string = usableCommands.map(c =>
				`${Util.padRight(c.name, widest + 1)}${c.guildOnly ? '*' : ' '}: ${cInfo(c).desc}`)
					.sort()
					.join('\n');

			const data: TemplateData = {
				commandList: commandList,
				usage: cInfo(this).usage,
				mentionUsage: cInfo(this).usage
					.replace('<prefix>', mentionName)
			};

			output = res('CMD_HELP_COMMAND_LIST', data);
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
				data.commandList = commandList;
				output = res('CMD_HELP_COMMAND_LIST', data);
			}
		}
		else
		{
			command = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.find(c => c.name === commandName || c.aliases.includes(commandName));

			if (!command) output = res('CMD_HELP_UNKNOWN_COMMAND');
			else
			{
				const info: LocalizedCommandInfo = cInfo(command);
				output = res('CMD_HELP_CODEBLOCK', {
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
				if (command) message.reply(res('CMD_HELP_REPLY_CMD'));
				else message.reply(res('CMD_HELP_REPLY_ALL'));
			}
		}
		catch (err)
		{
			if (!dm && !this.client.selfbot)
				message.reply(res('CMD_HELP_REPLY_FAIL'));
		}

		if (outMessage) outMessage.delete(30e3);
	}
}
