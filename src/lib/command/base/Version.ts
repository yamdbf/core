import { Bot } from '../../bot/Bot';
import { Message } from '../../types/Message';
import { Command } from '../Command';

export default class Version extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'version',
			description: 'Get the version of the bot',
			usage: `<prefix>version`,
			group: 'base',
			guildOnly: false
		});
	}

	public action(message: Message): void
	{
		this._respond(message, `Current version is: **${this.bot.version}**`);
	}
}
