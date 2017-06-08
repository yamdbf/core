import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import * as CommandDecorators from '../../CommandDecorators';
const { using } = CommandDecorators;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'disablegroup',
			description: 'Disable a command group',
			aliases: ['disable', 'dg'],
			usage: '<prefix>disablegroup <group>',
			extraHelp: 'Disables a command group so that all of the commands in the group cannot be used on this server.',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<group>': 'String' }))
	public async action(message: Message, [group]: [string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: `Command group "${group}" does not exist.`,
			DISABLED: `Command group "${group}" is already disabled or is not allowed to be disabled.`
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || disabledGroups.includes(group))
			return this.respond(message, err.DISABLED);

		disabledGroups.push(group);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, `**Disabled command group "${group}"**`);
	}
}
