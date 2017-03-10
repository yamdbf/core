import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';

export default class EnableGroup extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'enablegroup',
			description: 'Enable a command group',
			aliases: ['enable', 'eg'],
			usage: '<prefix>enablegroup <group>',
			extraHelp: 'Enables a command group so that all of the commands in the group can be used on this server.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.expect({ '<group>': 'String' }));
	}

	public action(message: Message, [group]: [string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: `Command group ${group} does not exist.`,
			ENABLED: `Command group ${group} is already enabled.`
		};

		if (!this.bot.commands.groups.includes(group)) return this._respond(message, err.NO_EXIST);
		if (group === 'base' || !message.guild.storage.getSetting('disabledGroups').includes(group))
			return this._respond(message, err.ENABLED);

		let disabledGroups: string[] = message.guild.storage.getSetting('disabledGroups');
		disabledGroups.splice(disabledGroups.indexOf(group), 1);
		message.guild.storage.setSetting('disabledGroups', disabledGroups);

		this._respond(message, `**Enabled command group "${group}"**`);
	}
}
