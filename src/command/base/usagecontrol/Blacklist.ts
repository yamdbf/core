import { User, GuildMember } from 'discord.js';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Middleware } from '../../middleware/Middleware';
import { using } from '../../CommandDecorators';
import { ResourceProxy } from '../../../types/ResourceProxy';
const { resolve, expect, localize } = Middleware;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'blacklist',
			desc: 'Blacklist a user from calling commands',
			aliases: ['bl'],
			usage: `<prefix>blacklist <action> <user> ['global']`,
			info: 'If global, this will block the user from calling commands in ANY server and DMs',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(resolve(`action: ['add', 'remove'], user: User`))
	@using(expect(`action: ['add', 'remove'], user: User`))
	@using(localize)
	public async action(message: Message, [res, action, user, global]: [ResourceProxy, string, User, string]): Promise<any>
	{
		if (action === 'add')
		{
			if (user.id === message.author.id)
				return message.channel.send(res.CMD_BLACKLIST_ERR_NOSELF());

			if (user.bot) return message.channel.send(res.CMD_BLACKLIST_ERR_NOBOT());

			if (global === 'global')
			{
				if (!this.client.isOwner(message.author))
					return message.channel.send(res.CMD_BLACKLIST_ERR_OWNERONLY());

				const globalBlacklist: any = await this.client.storage.get('blacklist') || {};
				if (globalBlacklist[user.id])
					return message.channel.send(res.CMD_BLACKLIST_ERR_ALREADYGLOBAL());

				await this.client.storage.set(`blacklist.${user.id}`, true);
				this.client.emit('blacklistAdd', user, true);
				return message.channel.send(res.CMD_BLACKLIST_GLOBALSUCCESS({ user: user.tag }));
			}

			let member!: GuildMember;
			try { member = message.guild.members.get(user.id) || await message.guild.members.fetch(user); }
			catch (err) {}

			if (member && member.permissions.has('ADMINISTRATOR'))
				return message.channel.send(res.CMD_BLACKLIST_ERR_BADTARGET());

			const guildBlacklist: any = await message.guild.storage!.settings.get('blacklist') || {};
			if (guildBlacklist[user.id])
				return message.channel.send(res.CMD_BLACKLIST_ERR_ALREADYBLACKLISTED());

			await message.guild.storage!.settings.set(`blacklist.${user.id}`, true);
			this.client.emit('blacklistAdd', user, false);
			return message.channel.send(res.CMD_BLACKLIST_SUCCESS({ user: user.tag }));
		}
		else if (action === 'remove')
		{
			if (global === 'global')
			{
				if (!this.client.isOwner(message.author))
					return message.channel.send(res.CMD_WHITELIST_ERR_OWNERONLY());

				const globalBlacklist: any = await this.client.storage.get('blacklist') || {};
				if (!globalBlacklist[user.id])
					return message.channel.send(res.CMD_WHITELIST_ERR_NOTGLOBAL());

				await this.client.storage.remove(`blacklist.${user.id}`);
				this.client.emit('blacklistRemove', user, true);
				return message.channel.send(res.CMD_WHITELIST_GLOBALSUCCESS({ user: user.tag }));
			}

			const guildBlacklist: any = await message.guild.storage!.settings.get('blacklist') || {};
			if (!guildBlacklist[user.id])
				return message.channel.send(res.CMD_WHITELIST_ERR_NOTBLACKLISTED());

			await message.guild.storage!.settings.remove(`blacklist.${user.id}`);
			this.client.emit('blacklistRemove', user, false);
			return message.channel.send(res.CMD_WHITELIST_SUCCESS({ user: user.tag }));
		}
	}
}
