import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { Message } from '../types/Message';
import { Command } from './Command';

export class CommandDecorators
{
	/**
	 * Apply a middleware function to the action method of a command.
	 * Identical to `Command#use()` but used as a method decorator
	 */
	public static using(func: MiddlewareFunction): MethodDecorator
	{
		return function(target: Command<any>, key: string, descriptor: PropertyDescriptor): PropertyDescriptor
		{
			if (!target) throw new Error('@using must be used as a method decorator for a Command action method.');
			if (key !== 'action') throw new Error(`"${target.constructor.name}#${key}" is not a valid method target for @using.`);
			if (!descriptor) descriptor = Object.getOwnPropertyDescriptor(target, key);
			const original: any = descriptor.value;
			descriptor.value = async function(message: Message, args: any[]): Promise<any>
			{
				let middlewarePassed: boolean = true;
				try
				{
					let result: Promise<[Message, any[]]> | [Message, any[]] =
						func.call(this, message, args);
					if (result instanceof Promise) result = await result;
					if (!(result instanceof Array))
					{
						if (typeof result === 'string') message.channel.send(result);
						middlewarePassed = false;
					}
					if (middlewarePassed) [message, args] = result;
				}
				catch (err)
				{
					middlewarePassed = false;
					message.channel.send(err.toString());
				}
				if (middlewarePassed) return await original.apply(this, [message, args]);
			};
			return descriptor;
		};
	}
}
