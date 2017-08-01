import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { using, localizable } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'enablegroup',
			desc: 'Enable a command group',
			aliases: ['enable', 'eg'],
			usage: '<prefix>enablegroup <group>',
			info: 'Enables a command group so that all of the commands in the group can be used on this server.',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<group>': 'String' }))
	@localizable
	public async action(message: Message, [res, group]: [ResourceLoader, string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res(s.CMD_ENABLEGROUP_ERR_NOEXIST, { group }),
			ENABLED: res(s.CMD_ENABLEGROUP_ERR_ENABLED, { group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || !disabledGroups.includes(group))
			return this.respond(message, err.ENABLED);

		disabledGroups.splice(disabledGroups.indexOf(group), 1);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res(s.CMD_ENABLEGROUP_SUCCESS, { group }));
	}
}
