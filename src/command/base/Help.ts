import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Util } from '../../util/Util';
import { Command } from '../Command';
import { Collection, RichEmbed } from 'discord.js';

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'help',
			description: 'Provides information on bot commands',
			usage: `<prefix>help [command]`,
			extraHelp: 'Will DM bot command help information to the user to keep clutter down in guild channels. If you use the help command from within a DM you will only receive information for the commands you can use within the DM. If you want help with commands usable in a guild, call the help command in a guild channel. You will receive a list of the commands that you have permissions/roles for in that channel.'
		});
	}

	public async action(message: Message, [commandName]: [string]): Promise<void>
	{
		if (this.client.selfbot) message.delete();
		const dm: boolean = message.channel.type !== 'text';
		const mentionName: string = `@${this.client.user.tag}`;

		let command: Command<Client>;
		let output: string = '';
		let embed: RichEmbed = new RichEmbed();

		if (!commandName)
		{
			const preText: string = `Available commands: (Commands marked with \`*\` are server-only)\n\`\`\`ldif\n`;
			const postText: string = `\`\`\`Use \`<prefix>help <command>\` ${this.client.selfbot ? '' : `or \`${
				mentionName} help <command>\` `}for more info\n\n`;

			const usableCommands: Collection<string, Command<Client>> = this.client.commands
				.filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
				.filter(c => !c.hidden);

			const widest: number = usableCommands.map(c => c.name.length).reduce((a, b) => Math.max(a, b));
			let commandList: string = usableCommands.map(c =>
				`${Util.padRight(c.name, widest + 1)}${c.guildOnly ? '*' : ' '}: ${c.description}`).sort().join('\n');

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
			else output = '```ldif\n'
				+ (command.guildOnly ? '[Server Only]\n' : '')
				+ (command.ownerOnly ? '[Owner Only]\n' : '')
				+ `Command: ${command.name}\n`
				+ `Description: ${command.description}\n`
				+ (command.aliases.length > 0 ? `Aliases: ${command.aliases.join(', ')}\n` : '')
				+ `Usage: ${command.usage}\n`
				+ (command.extraHelp ? `\n${command.extraHelp}` : '')
				+ '\n```';
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
