import { ResourceLoader } from '../../types/ResourceLoader';
import { BaseStrings as s } from '../../localization/BaseStrings';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'setprefix',
			desc: 'Set or check command prefix',
			aliases: ['prefix'],
			usage: '<prefix>setprefix [prefix]',
			info: 'Prefixes may be 1-10 characters in length and may not include backslashes or backticks. Use "clear" to clear the prefix and allow commands to be called without a prefix.',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@localizable
	public async action(message: Message, [res, prefix]: [ResourceLoader, string]): Promise<any>
	{
		if (!prefix)
			return this.respond(message, res(s.CMD_PREFIX_CURRENT,
				{ prefix: await this.client.getPrefix(message.guild) }));

		if (prefix.length > 10)
			return this.respond(message, res(s.CMD_PREFIX_ERR_CHAR_LIMIT));

		if (/[\\`]/.test(prefix))
			return this.respond(message, res(s.CMD_PREFIX_ERR_INVALID_CHARS));

		if (prefix === 'clear') prefix = '';

		if (this.client.selfbot)
			for (const guild of this.client.storage.guilds.values())
				await guild.settings.set('prefix', prefix);
		else await message.guild.storage.settings.set('prefix', prefix);

		return this.respond(message, res(s.CMD_PREFIX_SUCCESS, { prefix }));
	}
}
