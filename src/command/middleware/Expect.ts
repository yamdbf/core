import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ExpectArgType } from '../../types/ExpectArgType';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { Lang } from '../../localization/Lang';
import { Util } from '../../util/Util';
import { ResourceLoader } from '../../types/ResourceLoader';
import { GuildMember, Role, TextChannel, User } from 'discord.js';

export type MappedExpectArgType = { [name: string]: ExpectArgType };

export function expect(argTypes: string | MappedExpectArgType): MiddlewareFunction
{
	if (typeof argTypes === 'string') argTypes =
		<MappedExpectArgType> Util.parseArgTypes(argTypes);

	const names: string[] = Object.keys(argTypes);
	const types: ExpectArgType[] = names
		.map(name => (<MappedExpectArgType> argTypes)[name]);

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

		for (const [index, name] of names.entries())
		{
			const arg: any = args[index];
			const type: ExpectArgType = types[index];

			if (dm && !(type instanceof Array)
				&& !['String', 'Number', 'User', 'Any'].includes(<string> type))
				throw new Error(
					`in arg \`${name}\`: Type \`${type}\` is not usable within DM-capable commands.`);

			if (typeof arg === 'undefined' || arg === null)
				throw new Error(res('EXPECT_ERR_MISSING_VALUE', {
					type: type instanceof Array ? type.map(t => `\`${t}\``).join(', ') : `\`${type}\``,
					name,
					usage
				}));

			if (type === 'Any') continue;

			if (type instanceof Array)
			{
				if (!type.map(a => a.toLowerCase()).includes(arg.toLowerCase()))
					throw new Error(res('EXPECT_ERR_INVALID_OPTION',
						{ type: type.map(t => `\`${t}\``).join(', '), name, arg, usage }));
			}
			else if (type === 'String')
			{
				if (typeof arg !== 'string')
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'String', type: arg.constructor.name }));
			}
			else if (type === 'Number')
			{
				if (typeof arg !== 'number' || (!isNaN(arg) && !isFinite(arg)))
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'Number', type: arg === Infinity ? 'Infinity' : arg.constructor.name }));
			}
			else if (type === 'User')
			{
				if (!(arg instanceof User))
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'User', type: arg.constructor.name }));
			}
			else if (type === 'Member')
			{
				if (!(arg instanceof GuildMember))
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'GuildMember', type: arg.constructor.name }));
			}
			else if (type === 'Channel')
			{
				if (!(arg instanceof TextChannel))
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'TextChannel', type: arg.constructor.name }));
			}
			else if (type === 'Role')
			{
				if (!(arg instanceof Role))
					throw new Error(res('EXPECT_ERR_EXPECTED_TYPE',
						{ name, expected: 'Role', type: arg.constructor.name }));
			}
			else
			{
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);
			}
		}

		return [message, args];
	};
}
