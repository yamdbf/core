import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { User, Collection } from 'discord.js';

export class BannedUserResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'BannedUser');
	}

	public async validate(value: any): Promise<boolean>
	{
		return value instanceof User;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<User>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;
		const normalizeUser: (text: string) => string =
			text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');

		const bannedUsers: Collection<string, User> = await message.guild.fetchBans();

		let user: User;
		if (idRegex.test(value))
		{
			user = bannedUsers.get(value.match(idRegex)[1]);
			if (!user)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'BannedUser' }));
		}
		else
		{
			const normalized: string = normalizeUser(value);
			let users: Collection<string, User> = bannedUsers.filter(a =>
				normalizeUser(a.username).includes(normalized)
					|| normalizeUser(a.tag).includes(normalized));

			if (users.size > 1)
				throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
					name,
					usage,
					users: users.map(u => `\`${u.tag}\``).join(', ')
				}));

			user = users.first();
			if (!user)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'BannedUser' }));
		}

		return user;
	}
}
