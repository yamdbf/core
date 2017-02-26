'use babel';
'use strict';

import { normalize } from '../../Util';

/** @module Middleware */

/**
 * Takes an object mapping argument names to argument types that
 * resolves args to their specified type or throws errors for
 * any invalid input.
 *
 * Valid types are:
 * `String`, `Number`, `User`, `Member`, `Role`, `Channel`
 *
 * Example:
 * ```
 * { '<mem>': 'Member', '<age>': 'Number', '<...desc>': 'String' }
 * ```
 *
 * Supports `...` in the argument name as the final argument to
 * gather the remaining args into one string
 * @param {object} argTypes An object of argument names mapped to argument types
 * @returns {Function}
 */
export default function resolveArgs(argTypes)
{
	return async function(message, args)
	{
		const names = Object.keys(argTypes);
		const types = names.map(a => argTypes[a]);

		const normalizeUser = text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');

		const prefix = message.guild.storage.getSetting('prefix');
		const usage = `Usage: \`${this.usage.replace('<prefix>', prefix)}\``;
		const idRegex = /^(?:<@!?)?(\d+)>?$/;
		for (const [index, arg] of args.entries())
		{
			if (index > names.length - 1) break;

			const name = names[index];
			const type = types[index];
			if (name.includes('...'))
			{
				if (index !== names.length - 1) throw new Error(
					`Rest arg \`${name}\` must be the final argument descriptor.`);

				if (type !== 'String') throw new Error(
					`in rest arg \`${name}\`: Rest args can only resolve to Strings.`);

				args[index] = args.slice(index).join(' ');
				args = args.slice(0, index + 1);
				break;
			}

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

			else if (type === 'User')
			{
				let user;
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
					if (!user) throw new Error(`in arg \`${name}\`:  Failed to find a user with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized = normalizeUser(arg);
					let users = this.bot.users.filter(a => normalizeUser(a.username).includes(normalized)
						|| normalizeUser(`${a.username}#${a.discriminator}`).includes(normalized));

					if (users.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
						users.map(a => `\`${a.username}#${a.discriminator}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${name}\`: Failed to find a user containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = user;
			}

			else if (type === 'Member')
			{
				let member;
				if (idRegex.test(arg))
				{
					try
					{
						member = await message.guild.fetchMember(arg.match(idRegex)[1]);
					}
					catch (err)
					{
						throw new Error(`in arg \`${name}\`: Failed to find a member with ID \`${arg}\`.\n${usage}`);
					}
					if (!member) throw new Error(`in arg \`${name}\`: Failed to find a member with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized = normalizeUser(arg);
					let members = message.guild.members.filter(a => normalizeUser(a.displayName).includes(normalized)
						|| normalizeUser(a.user.username).includes(normalized)
						|| normalizeUser(`${a.user.username}#${a.user.discriminator}`).includes(normalized));

					if (members.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
						members.map(a => `\`${a.user.username}#${a.user.discriminator}\``)
							.join(', ')}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					member = members.first();
					if (!member) throw new Error(
						`in arg \`${name}\`: Failed to find a member containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = member;
			}

			else if (type === 'BannedUser')
			{
				const bannedUsers = await message.guild.fetchBans();
				let user;
				if (idRegex.test(arg))
				{
					user = bannedUsers.get(arg.match(idRegex)[1]);
					if (!user) throw new Error(`in arg \`${name}\`:  Failed to find a banned user with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized = normalizeUser(arg);
					let users = bannedUsers.filter(a => normalizeUser(a.username).includes(normalized)
						|| normalizeUser(`${a.username}#${a.discriminator}`).includes(normalized));

					if (users.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
						users.map(a => `\`${a.username}#${a.discriminator}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${name}\`: Failed to find a banned user containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = user;
			}

			else if (type === 'Channel')
			{
				let channel;
				const channelRegex = /^(?:<#)?(\d+)>?$/;
				if (channelRegex.test(arg))
				{
					const id = arg.match(channelRegex)[1];
					channel = message.guild.channels.get(id);
					if (!channel) throw new Error(`in arg \`${name}\`: Failed to find a channel with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized = normalize(arg);
					let channels = message.guild.channels.filter(a => a.type === 'text')
						.filter(a => normalize(a.name).includes(normalized));

					if (channels.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
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
				let role;
				const roleRegex = /^(?:<@&)?(\d+)>?$/;
				if (roleRegex.test(arg))
				{
					const id = arg.match(roleRegex)[1];
					role = message.guild.roles.get(id);
					if (!role) throw new Error(`in arg \`${name}\`: Failed to find a role with ID \`${arg}\`.\n${usage}`);
				}
				else
				{
					const normalized = normalize(arg);
					let roles = message.guild.roles.filter(a => normalize(a.name).includes(normalized));

					if (roles.size > 1) throw String(`Found multiple potential matches for arg \`${name}\`:\n${
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
		}

		return [message, args];
	};
}
