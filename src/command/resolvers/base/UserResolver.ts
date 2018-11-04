import { User, Collection } from 'discord.js';
import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { Util } from '../../../util/Util';

export class UserResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'User');
	}

	public async validate(value: any): Promise<boolean>
	{
		return value instanceof User;
	}

	public async resolveRaw(value: string, context: Partial<Message> = {}): Promise<User | Collection<string, User> | undefined>
	{
		let user!: User;
		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;

		if (idRegex.test(value))
		{
			try
			{
				const userID: string = value.match(idRegex)![1];
				user = this.client.users.get(userID) || await this.client.users.fetch(userID);
			} catch {}
			if (!user) return;
		}
		else
		{
			const normalized: string = Util.normalize(value);
			let users: Collection<string, User> = this.client.users.filter(a =>
				Util.normalize(a.username).includes(normalized)
					|| Util.normalize(a.tag).includes(normalized));

			if (context.guild)
				users = users.concat(new Collection(
					context.guild.members
						.filter(a => Util.normalize(a.displayName).includes(normalized))
						.map(a => [a.id, a.user] as [string, User])));

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
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'User' }));
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
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'User' }));
		}

		return user as User;
	}
}
