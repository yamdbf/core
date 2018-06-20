import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { User, Collection } from 'discord.js';
import { Util } from '../../../util/Util';

export class BannedUserResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'BannedUser');
	}

	public validate(value: any): boolean
	{
		return value instanceof User;
	}

	public async resolveRaw(value: string, context: Partial<Message> = {}): Promise<User | Collection<string, User> | undefined>
	{
		if (!context.guild) throw new Error('Cannot resolve given value: missing context');

		let user: User;
		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;

		type BanInfo = { user: User, reason: string };
		const bans: Collection<string, BanInfo> = await context.guild!.fetchBans();
		const bannedUsers: Collection<string, User> =
			new Collection(bans.map(b => [b.user.id, b.user] as [string, User]));

		if (idRegex.test(value))
		{
			user = bannedUsers.get(value.match(idRegex)![1])!;
			if (!user) return;
		}
		else
		{
			const normalized: string = Util.normalize(value);
			let users: Collection<string, User> = bannedUsers.filter(a =>
				Util.normalize(a.username).includes(normalized)
					|| Util.normalize(a.tag).includes(normalized));

			if (users.size === 1) user = users.first()!;
			else return users;
		}

		return user;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<User>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;

		let user: User | Collection<string, User> = (await this.resolveRaw(value, message))!;
		if (idRegex.test(value))
		{
			if (!user)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'BannedUser' }));
		}
		else
		{
			if (user instanceof Collection)
			{
				if (user.size > 1)
					throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
						name,
						usage,
						users: user.map(u => `\`${u.tag}\``).join(', ')
					}));

				user = user.first()!;
			}

			if (!user)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'BannedUser' }));
		}

		return user as User;
	}
}
