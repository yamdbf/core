import { Collection, GuildMember, Role, TextChannel, User } from 'discord.js';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ResolveArgType } from '../../types/ResolveArgType';
import { ResourceLoader } from '../../types/ResourceLoader';
import { BaseStrings as s } from '../../localization/BaseStrings';
import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Util } from '../../util/Util';
import { Time } from '../../util/Time';
import { Command } from '../Command';

export type MappedResolveArgType = { [name: string]: ResolveArgType };

export function resolve(argTypes: string | MappedResolveArgType): MiddlewareFunction
{
	if (typeof argTypes === 'string') argTypes =
		<MappedResolveArgType> Util.parseArgTypes(argTypes);

	const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;
	const normalizeUser: (text: string) => string =
		text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');

	const names: string[] = Object.keys(argTypes);
	const types: ResolveArgType[] = names
		.map(name => (<MappedResolveArgType> argTypes)[name]);

	return async function(this: Command, message: Message, args: any[]): Promise<[Message, any[]]>
	{
		const dm: boolean = message.channel.type !== 'text';

		const lang: string = dm
			? this.client.defaultLang
			: await message.guild.storage.settings.get('lang')
				|| this.client.defaultLang;
		const res: ResourceLoader = Lang.createResourceLoader(lang);

		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(this, lang).usage.replace('<prefix>', prefix);

		let foundRestArg: boolean = false;
		for (let [index, arg] of args.entries())
		{
			if (index > names.length - 1) break;
			const name: string = names[index];
			const type: ResolveArgType = types[index];

			if (name.includes('...'))
			{
				if (index !== names.length - 1) throw new Error(
					`Rest arg \`${name}\` must be the final argument descriptor.`);

				arg = args.slice(index).join(' ');
				args[index] = arg;
				args = args.slice(0, index + 1);
				foundRestArg = true;
			}

			if (dm && !['String', 'Number', 'Duration', 'User'].includes(type))
				throw new Error(
					`in arg \`${name}\`: Type \`${type}\` is not usable within DM-capable commands.`);

			if (type === 'String')
			{
				args[index] = arg.toString();
			}

			else if (type === 'Number')
			{
				if (isNaN(arg))
					throw new Error(res(s.RESOLVE_ERR_RESOLVE_NUMBER, { name, arg, usage }));

				args[index] = parseFloat(arg);
			}

			else if (type === 'Duration')
			{
				let duration: number = Time.parseShorthand(arg);
				if (!duration)
					throw new Error(res(s.RESOLVE_ERR_RESOLVE_DURATION, { name, arg, usage }));

				args[index] = duration;
			}

			else if (type === 'User')
			{
				let user: User;
				if (idRegex.test(arg))
				{
					try { user = await message.client.fetchUser(arg.match(idRegex)[1]); }
					catch (err) {}
					if (!user) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg, usage, type }));
				}
				else
				{
					const normalized: string = normalizeUser(arg);
					let users: Collection<string, User> = this.client.users.filter(a =>
						normalizeUser(a.username).includes(normalized) || normalizeUser(a.tag).includes(normalized));

					if (message.channel.type === 'text')
						users = users.concat(new Collection(
							message.guild.members
								.filter(a => normalizeUser(a.displayName).includes(normalized))
								.map(a => <[string, User]> [a.id, a.user])));

					if (users.size > 1)
						throw String(res(s.RESOLVE_ERR_MULTIPLE_USER_RESULTS,
							{ name, usage, users: users.map(u => `\`${u.tag}\``).join(', ') }));

					user = users.first();
					if (!user) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg, usage, type }));
				}
				args[index] = user;
			}

			else if (type === 'Member')
			{
				let member: GuildMember;
				if (idRegex.test(arg))
				{
					try { member = await message.guild.fetchMember(arg.match(idRegex)[1]); }
					catch (err) {}
					if (!member) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg, usage, type }));
				}
				else
				{
					const normalized: string = normalizeUser(arg);
					let members: Collection<string, GuildMember> = message.guild.members
						.filter(a => normalizeUser(a.displayName).includes(normalized)
							|| normalizeUser(a.user.username).includes(normalized)
							|| normalizeUser(a.user.tag).includes(normalized));

					if (members.size > 1)
						throw String(res(s.RESOLVE_ERR_MULTIPLE_USER_RESULTS,
							{ name, usage, users: members.map(m => `\`${m.user.tag}\``).join(', ') }));

					member = members.first();
					if (!member) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg, usage, type }));
				}
				args[index] = member;
			}

			else if (type === 'BannedUser')
			{
				const bannedUsers: Collection<string, User> = await message.guild.fetchBans();
				let user: User;
				if (idRegex.test(arg))
				{
					user = bannedUsers.get(arg.match(idRegex)[1]);
					if (!user) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg, usage, type }));
				}
				else
				{
					const normalized: string = normalizeUser(arg);
					let users: Collection<string, User> = bannedUsers.filter(a =>
						normalizeUser(a.username).includes(normalized)
							|| normalizeUser(a.tag).includes(normalized));

					if (users.size > 1)
						throw String(res(s.RESOLVE_ERR_MULTIPLE_USER_RESULTS,
							{ name, usage, users: users.map(u => `\`${u.tag}\``).join(', ') }));

					user = users.first();
					if (!user) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg, usage, type }));
				}
				args[index] = user;
			}

			else if (type === 'Channel')
			{
				let channel: TextChannel;
				const channelRegex: RegExp = /^(?:<#)?(\d+)>?$/;
				if (channelRegex.test(arg))
				{
					const id: string = arg.match(channelRegex)[1];
					channel = <TextChannel> message.guild.channels.get(id);
					if (!channel) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg, usage, type }));
				}
				else
				{
					const normalized: string = Util.normalize(arg);
					let channels: Collection<string, TextChannel> =
						(<Collection<string, TextChannel>> message.guild.channels)
							.filter(a => a.type === 'text')
							.filter(a => Util.normalize(a.name).includes(normalized));

					if (channels.size > 1) throw String(
						res(s.RESOLVE_ERR_MULTIPLE_CHANNEL_RESULTS,
							{ name, usage, channels: channels.map(c => `\`#${c.name}\``).join(', ') }));

					channel = channels.first();
					if (!channel) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg, usage, type }));
				}
				args[index] = channel;
			}

			else if (type === 'Role')
			{
				let role: Role;
				const roleRegex: RegExp = /^(?:<@&)?(\d+)>?$/;
				if (roleRegex.test(arg))
				{
					const id: string = arg.match(roleRegex)[1];
					role = message.guild.roles.get(id);
					if (!role) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg, usage, type }));
				}
				else
				{
					const normalized: string = Util.normalize(arg);
					let roles: Collection<string, Role> = message.guild.roles.filter(a =>
						Util.normalize(a.name).includes(normalized));

					if (roles.size > 1) throw String(
						res(s.RESOLVE_ERR_MULTIPLE_ROLE_RESULTS,
							{ name, usage, roles: roles.map(r => `\`${r.name}\``).join(', ') }));

					role = roles.first();
					if (!role) throw new Error(
						res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg, usage, type }));
				}
				args[index] = role;
			}

			else
			{
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);
			}

			if (foundRestArg) break;
		}

		return [message, args];
	};
}
