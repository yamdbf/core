import { Collection, MessageEmbed } from 'discord.js';
import { LocalizedCommandInfo } from '../../types/LocalizedCommandInfo';
import { ResourceProxy } from '../../types/ResourceProxy';
import { TemplateData } from '../../types/TemplateData';
import { Message } from '../../types/Message';
import { using } from '../CommandDecorators';
import { Middleware } from '../middleware/Middleware';
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
			info: 'Will DM command help information to the user to keep clutter down in guild channels'
		});
	}

	@using(Middleware.localize)
	public async action(message: Message, [res, commandName]: [ResourceProxy, string]): Promise<void>
	{
		const dm: boolean = message.channel.type !== 'text';
		const mentionName: string = `@${this.client.user!.tag} `;
		const lang: string = dm ? this.client.defaultLang
			:  await message.guild.storage!.settings.get('lang');

		const cInfo: (cmd: Command) => LocalizedCommandInfo =
			(cmd: Command) => Lang.getCommandInfo(cmd, lang);

		let command!: Command;
		let output: string = '';
		let embed: MessageEmbed = new MessageEmbed();

		if (!commandName)
		{
			const usableCommands: Collection<string, Command> = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.filter(c => !c.hidden && !c.disabled);

			const widest: number = usableCommands
				.map(c => c.name.length)
				.reduce((a, b) => Math.max(a, b));

			let commandList: string[] = usableCommands.map(c =>
				`${Util.padRight(c.name, widest + 1)}${c.guildOnly ? '*' : ' '}: ${cInfo(c).desc}`)
					.sort();

			const shortcuts: { [name: string]: string } = !dm
				? await message.guild.storage!.settings.get('shortcuts') || {}
				: {};

			const data: TemplateData = {
				isGuild: !dm,
				commandList,
				shortcuts: Object.keys(shortcuts),
				usage: cInfo(this).usage,
				mentionUsage: cInfo(this).usage
					.replace('<prefix>', mentionName)
			};

			output = res.CMD_HELP_COMMAND_LIST(data);
			if (output.length >= 1024)
			{
				let mappedCommands: string[] = usableCommands
					.sort((a, b) => a.name < b.name ? -1 : 1)
					.map(c => (c.guildOnly ? '*' : ' ') + Util.padRight(c.name, widest + 2));

				data.commandList = mappedCommands;
				data.namesOnly = true;

				output = res.CMD_HELP_COMMAND_LIST(data);
			}
		}
		else
		{
			command = this.client.commands
				.filter(c => !c.disabled && !(!this.client.isOwner(message.author) && c.ownerOnly))
				.find(c => c.name === commandName || c.aliases.includes(commandName));

			if (!command) output = res.CMD_HELP_UNKNOWN_COMMAND();
			else
			{
				const info: LocalizedCommandInfo = cInfo(command);
				output = res.CMD_HELP_CODEBLOCK({
					serverOnly: command.guildOnly ? res.CMD_HELP_SERVERONLY() : '',
					ownerOnly: command.ownerOnly ? res.CMD_HELP_OWNERONLY() : '',
					commandName: command.name,
					desc: info.desc,
					aliasText: command.aliases.length > 0
						? res.CMD_HELP_ALIASES({ aliases: command.aliases })
						: '',
					usage: info.usage,
					info: info.info ? `\n${info.info}` : ''
				});
			}
		}

		output = dm ? output.replace(/<prefix>/g, '')
			: output.replace(/<prefix>/g, await this.client.getPrefix(message.guild) || '');

		embed.setColor(11854048).setDescription(output);

		try
		{
			if (!this.client.dmHelp) await this.respond(message, '', { embed });
			else await message.author.send({ embed });

			if (!dm && this.client.dmHelp)
			{
				if (command) message.reply(res.CMD_HELP_REPLY_CMD());
				else message.reply(res.CMD_HELP_REPLY_ALL());
			}
		}
		catch { if (!dm) message.reply(res.CMD_HELP_REPLY_FAIL()); }
	}
}
