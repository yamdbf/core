import { Client } from '../../client/Client';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ExpectArgType } from '../../types/ExpectArgType';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { GuildMember, Role, TextChannel, User } from 'discord.js';

export function expect<T extends Command>(argTypes: { [name: string]: ExpectArgType }): MiddlewareFunction
{
	return async function(this: T, message: Message, args: any[]): Promise<[Message, any[]]>
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

			if (dm && !(type instanceof Array) && !['String', 'Number', 'User', 'Any'].includes(<string> type))
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not usable within DM-capable commands.`);

			if (typeof arg === 'undefined' || arg === null)
			{
				let error: string = `Missing or null value for arg: \`${name}\``;
				if (type instanceof Array) error += `\nExpected one of: \`${type.join('`, `')}\``;
				else error += `, expected \`${type}\``;
				throw new Error(error += `\n${usage}`);
			}

			if (type === 'Any') continue;

			if (type instanceof Array)
			{
				if (!type.map(a => a.toLowerCase()).includes(arg.toLowerCase()))
					throw new Error([
						`in arg \`${name}\`: \`${arg}\` is not a valid option`,
						`${usage}\nValid options for arg \`${name}\`: \`${type.join('`, `')}\``
					].join('\n'));
			}
			else if (type === 'String')
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