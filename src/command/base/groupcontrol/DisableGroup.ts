import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { using, localizable } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'disablegroup',
			desc: 'Disable a command group',
			aliases: ['disable', 'dg'],
			usage: '<prefix>disablegroup <group>',
			info: 'Disables a command group so that all of the commands in the group cannot be used on this server.',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<group>': 'String' }))
	@localizable
	public async action(message: Message, [res, group]: [ResourceLoader, string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res('CMD_DISABLEGROUP_ERR_NOEXIST', { group }),
			DISABLED: res('CMD_DISABLEGROUP_ERR_DISABLED', { group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || disabledGroups.includes(group))
			return this.respond(message, err.DISABLED);

		disabledGroups.push(group);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res('CMD_DISABLEGROUP_SUCCESS', { group }));
	}
}
