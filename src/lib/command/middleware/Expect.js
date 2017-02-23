'use babel';
'use strict';

import { User, GuildMember, TextChannel, Role } from 'discord.js';

export default function expect(argTypes)
{
	return function(message, args)
	{
		const names = Object.keys(argTypes);
		const types = names.map(a => argTypes[a]);

		for (const [index, arg] of args.entries())
		{
			if (index > types.length - 1) break;

			const name = names[index];
			const type = types[index];
			if (type === 'String')
			{
				if (typeof arg !== 'string')
					throw new Error(`in arg \`${name}\`: \`String\` expected, got \`${arg.constructor.name}\``);
			}
			else if (type === 'Number')
			{
				if (!(isNaN(arg) && isFinite(arg)))
					throw new Error(`in arg \`${name}\`: \`Number\` expected, got \`${arg.constructor.name}\``);
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
