import { Client } from '../../client/Client';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ExpectArgType } from '../../types/ExpectArgType';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { GuildMember, Role, TextChannel, User } from 'discord.js';

export function expect<T extends Client, U extends Command<T>>(argTypes: { [name: string]: ExpectArgType }): MiddlewareFunction
{
	return async function(this: U, message: Message, args: any[]): Promise<[Message, any[]]>
	{
		const names: string[] = Object.keys(argTypes);
		const types: ExpectArgType[] = names.map(a => argTypes[a]);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = `Usage: \`${this.usage.replace('<prefix>', prefix)}\``;

		for (const [index, name] of names.entries())
		{
			const arg: any = args[index];
			const type: ExpectArgType = types[index];

			if (dm && !['String', 'Number', 'User', 'Any'].includes(type))
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not usable within DM-capable commands.`);

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
