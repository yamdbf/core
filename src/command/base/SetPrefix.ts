import { Command } from '../Command';
import { Message } from '../../types/Message';
import { using } from '../CommandDecorators';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';

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

	@using(Middleware.localize)
	public async action(message: Message, [res, prefix]: [ResourceProxy, string]): Promise<any>
	{
		if (!prefix)
			return this.respond(message, res.CMD_PREFIX_CURRENT(
				{ prefix: (await this.client.getPrefix(message.guild))! }));

		if (prefix.length > 10)
			return this.respond(message, res.CMD_PREFIX_ERR_CHAR_LIMIT());

		if (/[\\`]/.test(prefix))
			return this.respond(message, res.CMD_PREFIX_ERR_INVALID_CHARS());

		if (prefix === 'clear') prefix = '';

		await message.guild.storage!.settings.set('prefix', prefix);

		return this.respond(message, res.CMD_PREFIX_SUCCESS({ prefix }));
	}
}
