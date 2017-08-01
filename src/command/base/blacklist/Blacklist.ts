import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { User, GuildMember } from 'discord.js';
import { using, localizable } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'blacklist',
			desc: 'Blacklist a user from calling commands',
			aliases: ['bl'],
			usage: '<prefix>blacklist <user> [\'global\']',
			info: 'If global, this will block the user from calling commands in ANY server and DMs',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.resolve({ '<user>': 'User' }))
	@using(Middleware.expect({ '<user>': 'User' }))
	@localizable
	public async action(message: Message, [res, user, global]: [ResourceLoader, User, string]): Promise<Message | Message[]>
	{
		if (user.id === message.author.id)
			return message.channel.send(res(s.CMD_BLACKLIST_ERR_NOSELF));

		if (user.bot) return message.channel.send(res(s.CMD_BLACKLIST_ERR_NOBOT));

		if (global === 'global')
		{
			if (!this.client.isOwner(message.author))
				return message.channel.send(res(s.CMD_BLACKLIST_ERR_OWNERONLY));

			const globalBlacklist: any = await this.client.storage.get('blacklist') || {};
			if (globalBlacklist[user.id])
				return message.channel.send(res(s.CMD_BLACKLIST_ERR_ALREADYGLOBAL));

			await this.client.storage.set(`blacklist.${user.id}`, true);
			this.client.emit('blacklistAdd', user, true);
			return message.channel.send(res(s.CMD_BLACKLIST_GLOBALSUCCESS, { user: user.tag }));
		}

		let member: GuildMember;
		try { member = await message.guild.fetchMember(user); }
		catch (err) {}

		if (member && member.permissions.has('ADMINISTRATOR'))
			return message.channel.send(res(s.CMD_BLACKLIST_ERR_BADTARGET));

		const guildBlacklist: any = await message.guild.storage.settings.get('blacklist') || {};
		if (guildBlacklist[user.id])
			return message.channel.send(res(s.CMD_BLACKLIST_ERR_ALREADYBLACKLISTED));

		await message.guild.storage.settings.set(`blacklist.${user.id}`, true);
		this.client.emit('blacklistAdd', user, false);
		return message.channel.send(res(s.CMD_BLACKLIST_SUCCESS, { user: user.tag }));
	}
}
