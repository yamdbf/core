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
			if (names[index].includes('...'))
			{
				if (index !== names.length - 1) throw new Error(
					`Rest arg \`${names[index]}\` must be the final argument descriptor.`);

				if (types[index] !== 'String') throw new Error(
					`in rest arg \`${names[index]}\`: Rest args can only resolve to Strings.`);

				args[index] = args.slice(index).join(' ');
				args = args.slice(0, index + 1);
				break;
			}

			if (types[index] === 'String')
			{
				args[index] = arg.toString();
			}

			else if (types[index] === 'Number')
			{
				args[index] = parseFloat(arg);
				if (isNaN(args[index])) throw new Error(
					`Arg \`${names[index]}\` could not be resolved to a number.\n${usage}`);
			}

			else if (types[index] === 'User')
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
						throw new Error(`in arg \`${names[index]}\`: Failed to find a user with that ID.\n${usage}`);
					}
					if (!user) throw new Error(`in arg \`${names[index]}\`: Failed to find a user with that ID.\n${usage}`);
				}
				else
				{
					const normalized = normalizeUser(arg);
					let users = this.bot.users.filter(a => normalizeUser(a.username).includes(normalized)
						|| normalizeUser(`${a.username}#${a.discriminator}`).includes(normalized));

					if (users.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						users.map(a => `\`${a.username}#${a.discriminator}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a user containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = user;
			}

			else if (types[index] === 'Member')
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
						throw new Error(`in arg \`${names[index]}\`: Failed to find a member with that ID.\n${usage}`);
					}
					if (!member) throw new Error(`in arg \`${names[index]}\`: Failed to find a member with that ID.\n${usage}`);
				}
				else
				{
					const normalized = normalizeUser(arg);
					let members = message.guild.members.filter(a => normalizeUser(a.displayName).includes(normalized)
						|| normalizeUser(a.user.username).includes(normalized)
						|| normalizeUser(`${a.user.username}#${a.user.discriminator}`).includes(normalized));

					if (members.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						members.map(a => `\`${a.user.username}#${a.user.discriminator}\``)
							.join(', ')}\nPlease refine your search, or consider using an ID/mention\n${usage}`);

					member = members.first();
					if (!member) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a member containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = member;
			}

			else if (types[index] === 'Channel')
			{
				let channel;
				const channelRegex = /^(?:<#)?(\d+)>?$/;
				if (channelRegex.test(arg))
				{
					const id = arg.match(channelRegex)[1];
					channel = message.guild.channels.get(id);
					if (!channel) throw new Error(`in arg \`${names[index]}\`: Failed to find a channel with that ID.\n${usage}`);
				}
				else
				{
					const normalized = normalize(arg);
					let channels = message.guild.channels.filter(a => a.type === 'text')
						.filter(a => normalize(a.name).includes(normalized));

					if (channels.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						channels.map(a => `\`#${a.name}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/channel link\n${usage}`);

					channel = channels.first();
					if (!channel) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a channel containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = channel;
			}

			else if (types[index] === 'Role')
			{
				let role;
				const roleRegex = /^(?:<@&)?(\d+)>?$/;
				if (roleRegex.test(arg))
				{
					const id = arg.match(roleRegex)[1];
					role = message.guild.roles.get(id);
					if (!role) throw new Error(`in arg \`${names[index]}\`: Failed to find a role with that ID.\n${usage}`);
				}
				else
				{
					const normalized = normalize(arg);
					let roles = message.guild.roles.filter(a => normalize(a.name).includes(normalized));

					if (roles.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						roles.map(a => `\`${a.name}\``).join(', ')
						}\nPlease refine your search, or consider using an ID/role mention\n${usage}`);

					role = roles.first();
					if (!role) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a role containing the text \`${arg}\`\n${usage}`);
				}
				args[index] = role;
			}

			else
			{
				throw new Error(`in arg \`${names[index]}\`: Type \`${types[index]}\` is not a valid argument type.`);
			}
		}

		return [message, args];
	};
}
