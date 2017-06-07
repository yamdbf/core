import { Collection, GuildMember, Role, TextChannel, User } from 'discord.js';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ResolveArgType } from '../../types/ResolveArgType';
import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Util } from '../../util/Util';
import { Time } from '../../util/Time';
import { Command } from '../Command';

export function resolve<T extends Client, U extends Command<T>>(argTypes: { [name: string]: ResolveArgType }): MiddlewareFunction
{
	return async function(this: U, message: Message, args: any[]): Promise<[Message, any[]]>
	{
		const names: string[] = Object.keys(argTypes);
		const types: ResolveArgType[] = names.map(a => argTypes[a]);

		const normalizeUser: (text: string) => string =
			text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = `Usage: \`${this.usage.replace('<prefix>', prefix)}\``;
		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;
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
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not usable within DM-capable commands.`);

			if (type === 'String')
			{
				args[index] = arg.toString();
			}

			else if (type === 'Number')
			{
				args[index] = parseFloat(arg);
				if (isNaN(args[index])) throw new Error(
					`in arg \`${name}\`: \`${arg}\` could not be resolved to a number.\n${usage}`);
			}

			else if (type === 'Duration')
			{
				let duration: number = Time.parseShorthand(arg);
				if (!duration) throw new Error([
					`in arg \`${name}\`: \`${arg}\` could not be resolved to a duration.\n${usage}`,
					`Duration examples: \`10m\`, \`2h\`, \`1.5d\``
				].join('\n'));

				args[index] = duration;
			}

			else if (type === 'User')
			{
				let user: User;
				if (idRegex.test(arg))
				{
					try
					{
						user = await message.client.fetchUser(arg.match(idRegex)[1]);
					}
					catch (err)
					{
						throw new Error(`in arg \`${name}\`: Failed to find a user with ID \`${arg}\`.\n${usage}`);
					}
					if (!user) throw new Error(
						`in arg \`${name}\`:  Failed to find a user with ID \`${arg}\`.\n${usage}`);
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

					if (users.size > 1) throw String(
						`Found multiple potential matches for arg \`${name}\`:\n${
							users.map(a => `\`${a.tag}\``).join(', ')
							}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${name}\`: Failed to find a user containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = user;
			}

			else if (type === 'Member')
			{
				let member: GuildMember;
				if (idRegex.test(arg))
				{
					try
					{
						member = await message.guild.fetchMember(arg.match(idRegex)[1]);
					}
					catch (err)
					{
						throw new Error(
							`in arg \`${name}\`: Failed to find a member with ID \`${arg}\`.\n${usage}`);
					}
					if (!member) throw new Error(
						`in arg \`${name}\`: Failed to find a member with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized: string = normalizeUser(arg);
					let members: Collection<string, GuildMember> = message.guild.members
						.filter(a => normalizeUser(a.displayName).includes(normalized)
							|| normalizeUser(a.user.username).includes(normalized)
							|| normalizeUser(a.user.tag).includes(normalized));

					if (members.size > 1) throw String(
						`Found multiple potential matches for arg \`${name}\`:\n${
							members.map(a => `\`${a.user.tag}\``).join(', ')
							}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					member = members.first();
					if (!member) throw new Error(
						`in arg \`${name}\`: Failed to find a member containing the text \`${arg}\`\n${usage}`);
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
						`in arg \`${name}\`:  Failed to find a banned user with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized: string = normalizeUser(arg);
					let users: Collection<string, User> = bannedUsers.filter(a =>
						normalizeUser(a.username).includes(normalized)
							|| normalizeUser(a.tag).includes(normalized));

					if (users.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
						users.map(a => `\`${a.tag}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${name}\`: Failed to find a banned user containing the text \`${arg}\`\n${usage}`);
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
						`in arg \`${name}\`: Failed to find a channel with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized: string = Util.normalize(arg);
					let channels: Collection<string, TextChannel> =
						(<Collection<string, TextChannel>> message.guild.channels)
							.filter(a => a.type === 'text')
							.filter(a => Util.normalize(a.name).includes(normalized));

					if (channels.size > 1) throw String(
						`Found multiple potential matches for arg \`${name}\`:\n${
							channels.map(a => `\`#${a.name}\``).join(', ')
							}\nPlease refine your search, or consider using an ID/channel link\n${usage}`);

					channel = channels.first();
					if (!channel) throw new Error(
						`in arg \`${name}\`: Failed to find a channel containing the text \`${arg}\`\n${usage}`);
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
					if (!role) throw new Error(`in arg \`${name}\`: Failed to find a role with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized: string = Util.normalize(arg);
					let roles: Collection<string, Role> = message.guild.roles.filter(a =>
						Util.normalize(a.name).includes(normalized));

					if (roles.size > 1) throw String(
						`Found multiple potential matches for arg \`${name}\`:\n${
							roles.map(a => `\`${a.name}\``).join(', ')
							}\nPlease refine your search, or consider using an ID/role mention\n${usage}`);

					role = roles.first();
					if (!role) throw new Error(
						`in arg \`${name}\`: Failed to find a role containing the text \`${arg}\`\n${usage}`);
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
