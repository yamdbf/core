'use babel';
'use strict';

/** @module Middleware */

/**
 * Takes an array of argument names and an array of associated
 * types matched by index and generates a middleware function
 * that resolves args to their specified type or throws errors
 * for any invalid input.
 * @param {string[]} names - An array of argument names
 * @param {string[]} types - An array of argument types. Valid types are:
 * 							 String, Number, User, Member, Role, Channel
 * @returns {*}
 */
export default function resolveArgs(names, types)
{
	return async function(message, args)
	{
		function normalize(text)
		{
			return text.toLowerCase().replace(/[^a-z0-9#]+/g, '');
		}

		const prefix = message.guild.storage.getSetting('prefix');
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
					`Arg \`${names[index]}\` could not be resolved to a number.\nUsage: \`${
						this.usage.replace('<prefix>', prefix)}\``);
			}

			else if (types[index] === 'User')
			{
				let user;
				if (idRegex.test(args[index]))
				{
					try
					{
						user = await message.client.fetchUser(args[index].match(idRegex)[1]);
					}
					catch (err)
					{
						throw new Error(`in arg \`${names[index]}\`: Failed to find a user with that ID.`);
					}
					if (!user) throw new Error(`in arg \`${names[index]}\`: Failed to find a user with that ID.`);
				}
				else
				{
					const normalized = normalize(args[index]);
					let users = this.bot.users.filter(a => normalize(a.username).includes(normalized)
						|| normalize(`${a.username}#${a.discriminator}`).includes(normalized));

					if (users.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						users.map(a => `\`${a.username}#${a.discriminator}\``).join(', ')}\nPlease refine your search, or consider using an ID/mention`);

					user = users.first();
					if (!user) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a user containing the text \`${args[index]}\``);
				}
				args[index] = user;
			}

			else if (types[index] === 'Member')
			{
				let member;
				if (idRegex.test(args[index]))
				{
					try
					{
						member = await message.guild.fetchMember(args[index].match(idRegex)[1]);
					}
					catch (err)
					{
						throw new Error(`in arg \`${names[index]}\`: Failed to find a member with that ID.`);
					}
					if (!member) throw new Error(`in arg \`${names[index]}\`: Failed to find a member with that ID.`);
				}
				else
				{
					const normalized = normalize(args[index]);
					let members = message.guild.members.filter(a => normalize(a.displayName).includes(normalized)
						|| normalize(a.user.username).includes(normalized)
						|| normalize(`${a.user.username}#${a.user.discriminator}`).includes(normalized));

					if (members.size > 1) throw String(`Found multiple potential matches for arg \`${names[index]}\`:\n${
						members.map(a => `\`${a.user.username}#${a.user.discriminator}\``)
							.join(', ')}\nPlease refine your search, or consider using an ID/mention`);

					member = members.first();
					if (!member) throw new Error(
						`in arg \`${names[index]}\`: Failed to find a member containing the text \`${args[index]}\``);
				}
				args[index] = member;
			}

			// else if (types[index] === 'Channel')
			// {

			// }

			// else if (types[index] === 'Role')
			// {

			// }
		}

		return [message, args];
	};
}
