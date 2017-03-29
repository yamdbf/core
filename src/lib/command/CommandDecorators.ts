import { PermissionResolvable } from 'discord.js';
import { Command } from './Command';
import { RateLimiter } from './RateLimiter';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { ArgOpts } from '../types/ArgOpts';
import { Message } from '../types/Message';

/**
 * Apply a middleware function to the action method of a command.
 * Identical to `Command#use()` but used as a method decorator
 */
export function using(func: MiddlewareFunction): MethodDecorator
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

/**
 * Set `name` metadata
 */
export function name(value: string): ClassDecorator
{
	return _setMetaData('name', value);
}

/**
 * Set `aliases` metadata
 */
export function aliases(...value: string[]): ClassDecorator
{
	return _setMetaData('aliases', value);
}

/**
 * Set `description` metadata
 */
export function description(value: string): ClassDecorator
{
	return _setMetaData('description', value);
}

/**
 * Set `usage` metadata
 */
export function usage(value: string): ClassDecorator
{
	return _setMetaData('usage', value);
}

/**
 * Set `extraHelp` metadata
 */
export function extraHelp(value: string): ClassDecorator
{
	return _setMetaData('extraHelp', value);
}

/**
 * Set `group` metadata
 */
export function group(value: string): ClassDecorator
{
	return _setMetaData('group', value);
}

/**
 * Set `argOpts` metadata
 */
export function argOpts(value: ArgOpts): ClassDecorator
{
	return _setMetaData('usage', value);
}

/**
 * Set `permissions` metadata
 */
export function permissions(...value: PermissionResolvable[]): ClassDecorator
{
	return _setMetaData('permissions', value);
}

/**
 * Set `roles` metadata
 */
export function roles(...value: string[]): ClassDecorator
{
	return _setMetaData('roles', value);
}

/**
 * Set `ratelimit` metadata
 */
export function ratelimit(value: string): ClassDecorator
{
	return _setMetaData('_rateLimiter', new RateLimiter(value, false));
}

/**
 * Set `overloads` metadata
 */
export function overloads(value: string): ClassDecorator
{
	return _setMetaData('overloads', value);
}

/**
 * Set `owneronly` flag metadata
 */
export function ownerOnly(target: typeof Command): ClassDecorator
{
	return _setFlagMetaData('ownerOnly');
}

/**
 * Set `guildOnly` flag metadata
 */
export function guildOnly(target: typeof Command): ClassDecorator
{
	return _setFlagMetaData('guildOnly');
}

/**
 * Set `hidden` flag metadata
 */
export function hidden(target: typeof Command): ClassDecorator
{
	return _setFlagMetaData('hidden');
}

/**
 * Set a boolean flag metadata on a class
 */
function _setFlagMetaData(flag: string): ClassDecorator
{
	return function(target: typeof Command): typeof Command
	{
		Object.defineProperty(target.prototype, flag, {
			value: true,
			enumerable: true,
		});
		return target;
	};
}

/**
 * Set an arbitrary value to an arbitrary key on a class
 */
function _setMetaData(key: string, value: any): ClassDecorator
{
	return function(target: typeof Command): typeof Command
	{
		Object.defineProperty(target.prototype, key, {
			value: value,
			configurable: true,
			enumerable: true,
			writable: true
		});
		return target;
	};
}
