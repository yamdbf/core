import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';

export default class DisableGroup extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'disablegroup',
			description: 'Disable a command group',
			aliases: ['disable', 'dg'],
			usage: '<prefix>disablegroup <group>',
			extraHelp: 'Disables a command group so that all of the commands in the group cannot be used on this server.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.expect({ '<group>': 'String' }));
	}

	public action(message: Message, [group]: [string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: `Command group ${group} does not exist.`,
			DISABLED: `Command group ${group} is already disabled or is not allowed to be disabled.`
		};

		if (!this.bot.commands.groups.includes(group)) return this._respond(message, err.NO_EXIST);
		if (group === 'base' || message.guild.storage.getSetting('disabledGroups').includes(group))
			return this._respond(message, err.DISABLED);

		let disabledGroups: string[] = message.guild.storage.getSetting('disabledGroups');
		disabledGroups.push(group);
		message.guild.storage.setSetting('disabledGroups', disabledGroups);

		this._respond(message, `**Disabled command group "${group}"**`);
	}
}
