import { Bot } from '../../../bot/Bot';
import { GuildStorage } from '../../../storage/GuildStorage';
import { Message } from '../../../types/Message';
import { Util } from '../../../Util';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';

export default class ClearLimit extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'clearlimit',
			description: 'Clear role restrictions from a command',
			usage: '<prefix>clearlimit <command>',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.expect({ '<command>': 'String' }));
	}

	public action(message: Message, [commandName]: [string]): Promise<Message | Message[]>
	{
		let command: Command<Bot> = this.bot.commands.find(c => Util.normalize(c.name) === Util.normalize(commandName));
		if (!command) return this._respond(message, `Failed to find a command with the name \`${commandName}\``);

		const storage: GuildStorage = message.guild.storage;
		let limitedCommands: { [name: string]: string[] } = storage.getSetting('limitedCommands') || {};
		delete limitedCommands[command.name];
		storage.setSetting('limitedCommands', limitedCommands);

		return this._respond(message, `Successfully cleared role limits for command: \`${command.name}\``);
	}
}
