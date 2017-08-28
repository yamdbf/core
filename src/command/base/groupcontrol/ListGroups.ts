import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { localizable } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'listgroups',
			desc: 'List all command groups and their status',
			aliases: ['lg'],
			usage: '<prefix>listgroups',
			info: `A '*' denotes a disabled group when listing all command groups.`,
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@localizable
	public async action(message: Message, [res]: [ResourceLoader]): Promise<any>
	{
		let groups: string[] = this.client.commands.groups;
		let disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];

		let output: string = res(s.CMD_LISTGROUPS_GROUPS,
			{ groups: groups.join(', '), disabledGroups: disabledGroups.join(', ') });

		return this.respond(message, output, { code: 'ldif' });
	}
}
