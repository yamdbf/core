import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { User } from 'discord.js';
import { using, localizable } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'whitelist',
			desc: 'Remove a user from the command blacklist',
			aliases: ['wl'],
			usage: '<prefix>whitelist <user> [\'global\']',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.resolve({ '<user>': 'User' }))
	@using(Middleware.expect({ '<user>': 'User' }))
	@localizable
	public async action(message: Message, [res, user, global]: [ResourceLoader, User, string]): Promise<Message | Message[]>
	{
		if (global === 'global')
		{
			if (!this.client.isOwner(message.author))
				return message.channel.send(res('CMD_WHITELIST_ERR_OWNERONLY'));

			const globalBlacklist: any = await this.client.storage.get('blacklist') || {};
			if (!globalBlacklist[user.id])
				return message.channel.send(res('CMD_WHITELIST_ERR_NOTGLOBAL'));

			await this.client.storage.remove(`blacklist.${user.id}`);
			this.client.emit('blacklistRemove', user, true);
			return message.channel.send(res('CMD_WHITELIST_GLOBALSUCCESS', { user: user.tag }));
		}

		const guildBlacklist: any = await message.guild.storage.settings.get('blacklist') || {};
		if (!guildBlacklist[user.id])
			return message.channel.send(res('CMD_WHITELIST_ERR_NOTBLACKLISTED'));

		await message.guild.storage.settings.remove(`blacklist.${user.id}`);
		this.client.emit('blacklistRemove', user, false);
		return message.channel.send(res('CMD_WHITELIST_SUCCESS', { user: user.tag }));
	}
}
