/* eslint-disable require-atomic-updates */
/* eslint-disable no-invalid-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
import { Command } from '../Command';
import { Message } from '../../types/Message';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { Resolver } from '../resolvers/Resolver';
import { Util } from '../../util/Util';

export interface MappedArgType { [arg: string]: string | string[] }

export function resolve(argTypes: string | MappedArgType): MiddlewareFunction
{
	if (typeof argTypes === 'string')
		argTypes =
			Util.parseArgTypes(argTypes) as MappedArgType;

	const names: string[] = Object.keys(argTypes);
	const types: (string | string[])[] = names
		.map(name => (argTypes as MappedArgType)[name]);

	return async function(this: Command, message: Message, args: any[]): Promise<[Message, any[]]>
	{
		let foundRestArg: boolean = false;
		// eslint-disable-next-line prefer-const
		for (let [index, arg] of args.entries())
		{
			if (index > names.length - 1) break;
			const name: string = names[index];
			let type: string | string[] = types[index];

			if (name.includes('...'))
			{
				if (index !== names.length - 1) throw new Error(
					`Rest arg \`${name}\` must be the final argument descriptor.`
				);

				arg = args.slice(index).join(' ');
				args[index] = arg;
				args = args.slice(0, index + 1);
				foundRestArg = true;
			}

			if (type instanceof Array) type = 'String';

			if (type === 'Any')
				continue;

			const resolver: Resolver = this.client.resolvers.get(type);
			if (!resolver)
				throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);

			const value: any = await resolver.resolve(message, this, name, arg);
			args[index] = value;

			if (foundRestArg) break;
		}

		return [message, args];
	};
}
