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
 * 							 String, Number, User, GuildMember, Role, Channel
 * @returns {*}
 */
export default function resolveArgs(names, types)
{
	return async function(message, args)
	{
		const prefix = message.guild.storage.getSetting('prefix');
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

			switch (types[index])
			{
				case 'String':
					args[index] = arg.toString();
					break;

				case 'Number':
					args[index] = parseFloat(arg);
					if (isNaN(args[index])) throw new Error(
						`Arg \`${names[index]}\` could not be resolved to a number.\nUsage: \`${
							this.usage.replace('<prefix>', prefix)}\``);
					break;

				case 'User':
				case 'GuildMember':
				case 'Role':
				case 'Channel':
			}
		}

		return [message, args];
	};
}
