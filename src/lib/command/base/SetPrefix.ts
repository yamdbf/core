import { Bot } from '../../bot/Bot';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { Middleware } from '../middleware/Middleware';

export default class SetPrefix extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'setprefix',
			description: 'Set or check the bot command prefix for this guild',
			aliases: ['prefix'],
			usage: '<prefix>setprefix <prefix>',
			extraHelp: 'Prefixes may be 1-10 characters in length and may not include backslashes or backticks. Set the prefix to "noprefix" to allow commands to be called without a prefix.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.resolveArgs({ '<prefix>': 'String' }));
	}

	public async action(message: Message, [prefix]: [string]): Promise<any>
	{
		if (!prefix)
			return this._respond(message, `${this.bot.getPrefix(message.guild)
				? `Current prefix is \`${this.bot.getPrefix(message.guild)}\``
				: 'There is currently no prefix.'}`);

		if (prefix.length > 10)
			return this._respond(message, `Prefixes may only be up to 10 chars in length.`);

		if (/[\\`]/.test(prefix))
			return this._respond(message, `Prefixes may not contain backticks or backslashes.`);

		if (prefix === 'noprefix') prefix = '';

		if (this.bot.selfbot)
			for (const guild of this.bot.guildStorages.values())
				guild.setSetting('prefix', prefix);

		else this.bot.guildStorages.get(message.guild).setSetting('prefix', prefix);
		this._respond(message, prefix === '' ? 'Command prefix removed.'
			: `Command prefix set to \`${prefix}\``);
	}
}
