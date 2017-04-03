import { Client } from '../../../client/Client';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'listgroups',
			description: 'List all command groups and their status',
			aliases: ['lg'],
			usage: '<prefix>listgroups',
			extraHelp: `A '*' denotes a disabled group when listing all command groups.`,
			permissions: ['ADMINISTRATOR']
		});
	}

	public async action(message: Message): Promise<void>
	{
		let groups: string[] = this.client.commands.groups;
		let disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];

		let output: string = 'Command groups:\n';
		for (const group of groups) output += `${disabledGroups.includes(group) ? '*' : ' '}${group}\n`;

		this.respond(message, output, 'ldif');
	}
}
