import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import * as CommandDecorators from '../../CommandDecorators';
const { using } = CommandDecorators;

export default class extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'enablegroup',
			description: 'Enable a command group',
			aliases: ['enable', 'eg'],
			usage: '<prefix>enablegroup <group>',
			extraHelp: 'Enables a command group so that all of the commands in the group can be used on this server.',
			permissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<group>': 'String' }))
	public async action(message: Message, [group]: [string]): Promise<Message | Message[]>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: `Command group ${group} does not exist.`,
			ENABLED: `Command group ${group} is already enabled.`
		};

		if (!this.bot.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || !disabledGroups.includes(group))
			return this.respond(message, err.ENABLED);

		disabledGroups.splice(disabledGroups.indexOf(group), 1);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, `**Enabled command group "${group}"**`);
	}
}
