import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';

export default class ListGroups extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'listgroups',
			description: 'List all command groups and their status',
			aliases: ['lg'],
			usage: '<prefix>listgroups',
			extraHelp: `A '*' denotes a disabled group when listing all command groups.`,
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	public action(message: Message): void
	{
		let groups: string[] = this.bot.commands.groups;
		let disabledGroups: string[] = message.guild.storage.getSetting('disabledGroups');

		let output: string = 'Command groups:\n';
		for (const group of groups) output += `${disabledGroups.includes(group) ? '*' : ' '}${group}\n`;

		this._respond(message, output, 'ldif');
	}
}
