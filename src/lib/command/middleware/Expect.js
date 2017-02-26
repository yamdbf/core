'use babel';
'use strict';

import { User, GuildMember, TextChannel, Role } from 'discord.js';

/** @module Middleware */

/**
 * Takes an object mapping argument names to argument types that
 * checks the types of passed arguments and ensures required
 * arguments are present and valid. Should be added to the
 * command AFTER any and all middleware functions that modify
 * args in any way are added.
 *
 * Valid types are:
 * `String`, `Number`, `User`, `Member`, `Role`, `Channel`, `Any`
 *
 * Example:
 * ```
 * { '<mem>': 'Member', '<age>': 'Number', '<desc>': 'String' }
 * ```
 *
 * If verifying a `BannedUser` returned from the ResolveArgs middleware,
 * use the `User` type.
 *
 * This middleware does not modify args in any way.
 * @param {object} argTypes An object of argument names mapped to argument types
 * @returns {Function}
 */
export default function expect(argTypes)
{
	return function(message, args)
	{
		const names = Object.keys(argTypes);
		const types = names.map(a => argTypes[a]);

		const prefix = message.guild.storage.getSetting('prefix');
		const usage = `Usage: \`${this.usage.replace('<prefix>', prefix)}\``;

		for (const [index, name] of names.entries())
		{
			const arg = args[index];
			const type = types[index];

			if (typeof args[index] === 'undefined' || args[index] === null)
				throw new Error(`Missing or null value for arg: \`${name}\`, expected \`${type}\`\n${usage}`);

			if (type === 'Any') continue;

			if (type === 'String')
			{
				if (typeof arg !== 'string')
					throw new Error(`in arg \`${name}\`: \`String\` expected, got \`${arg.constructor.name}\``);
			}
			else if (type === 'Number')
			{
				if (!isNaN(arg) && !isFinite(arg))
					throw new Error(`in arg \`${name}\`: \`Number\` expected, got \`${
						arg === Infinity ? Infinity : arg.constructor.name}\``);
			}
			else if (type === 'User')
			{
				if (!(arg instanceof User))
					throw new Error(`in arg \`${name}\`: \`User\` expected, got \`${arg.constructor.name}\``);
			}
			else if (type === 'Member')
			{
				if (!(arg instanceof GuildMember))
					throw new Error(`in arg \`${name}\`: \`GuildMember\` expected, got \`${arg.constructor.name}\``);
			}
			else if (type === 'Channel')
			{
				if (!(arg instanceof TextChannel))
					throw new Error(`in arg \`${name}\`: \`TextChannel\` expected, got \`${arg.constructor.name}\``);
			}
			else if (type === 'Role')
			{
				if (!(arg instanceof Role))
					throw new Error(`in arg \`${name}\`: \`Role\` expected, got \`${arg.constructor.name}\``);
			}
			else
			{
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);
			}
		}

		return [message, args];
	};
}
