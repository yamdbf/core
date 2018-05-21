import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { Lang } from '../../localization/Lang';
import { Util } from '../../util/Util';
import { MappedArgType } from './Resolve';
import { Resolver } from '../resolvers/Resolver';
import { ResourceProxy } from '../../types/ResourceProxy';
import { BaseStrings as s } from '../../localization/BaseStrings';

export function expect(argTypes: string | MappedArgType): MiddlewareFunction
{
	if (typeof argTypes === 'string') argTypes = Util.parseArgTypes(argTypes);

	const names: string[] = Object.keys(argTypes);
	const types: (string | string[])[] = names
		.map(name => (argTypes as MappedArgType)[name]);

	return async function(this: Command, message: Message, args: any[]): Promise<[Message, any[]]>
	{
		const dm: boolean = message.channel.type !== 'text';
		const lang: string = dm
			? this.client.defaultLang
			: await message.guild.storage!.settings.get('lang')
				|| this.client.defaultLang;

		const res: ResourceProxy = Lang.createResourceProxy(lang);
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(this, lang).usage!.replace(/<prefix>/g, prefix);

		for (const [index, name] of names.entries())
		{
			const arg: any = args[index];
			const type: string | string[] = types[index];

			if (typeof arg === 'undefined' || arg === null)
				throw new Error(res.EXPECT_ERR_MISSING_VALUE({
					type: type instanceof Array ? type.map(t => `\`${t}\``).join(', ') : `\`${type}\``,
					name,
					usage
				}));

			if (type === 'Any') continue;

			if (type instanceof Array)
			{
				if (!type.map(a => a.toLowerCase()).includes(arg.toLowerCase()))
					throw new Error(res.EXPECT_ERR_INVALID_OPTION({
						type: type.map(t => `\`${t}\``).join(', '),
						name,
						arg,
						usage
					}));
				continue;
			}

			const resolver: Resolver = this.client.resolvers.get(type);
			if (!resolver)
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);

			if (!(await resolver.validate(arg)))
				throw new Error(Lang.res('en_us', s.EXPECT_ERR_EXPECTED_TYPE,
					{ name, expected: type, type: arg === 'Infinity' ? arg : arg.constructor.name }));
		}

		return [message, args];
	};
}
