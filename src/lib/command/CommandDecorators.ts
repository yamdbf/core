import { PermissionResolvable } from 'discord.js';
import { Command } from './Command';
import { RateLimiter } from './RateLimiter';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { ArgOpts } from '../types/ArgOpts';
import { Message } from '../types/Message';

/**
 * Set `name` metadata
 */
function name(value: string): any
{
	return _setMetaData('name', value);
}

/**
 * Set `aliases` metadata
 */
function aliases(...value: string[]): any
{
	return _setMetaData('aliases', value);
}

/**
 * Set `description` metadata
 */
function description(value: string): any
{
	return _setMetaData('description', value);
}

/**
 * Set `usage` metadata
 */
function usage(value: string): any
{
	return _setMetaData('usage', value);
}

/**
 * Set `extraHelp` metadata
 */
function extraHelp(value: string): any
{
	return _setMetaData('extraHelp', value);
}

/**
 * Set `group` metadata
 */
function group(value: string): any
{
	return _setMetaData('group', value);
}

/**
 * Set `argOpts` metadata
 */
function argOpts(value: ArgOpts): any
{
	return _setMetaData('usage', value);
}

/**
 * Set `permissions` metadata
 */
function permissions(...value: PermissionResolvable[]): any
{
	return _setMetaData('permissions', value);
}

/**
 * Set `roles` metadata
 */
function roles(...value: string[]): any
{
	return _setMetaData('roles', value);
}

/**
 * Set `ratelimit` metadata
 */
function ratelimit(value: string): any
{
	return _setMetaData('_rateLimiter', new RateLimiter(value, false));
}

/**
 * Set `overloads` metadata
 */
function overloads(value: string): any
{
	return _setMetaData('overloads', value);
}

/**
 * Set `owneronly` metadata
 */
function ownerOnly(target: any): any
{
	Object.defineProperty(target.prototype, 'ownerOnly', {
			value: true,
			enumerable: true,
		});
		return target;
}

/**
 * Set `guildOnly` metadata
 */
function guildOnly(target: any): any
{
	Object.defineProperty(target.prototype, 'guildOnly', {
			value: true,
			enumerable: true,
		});
		return target;
}

/**
 * Set `hidden` metadata
 */
function hidden(target: any): any
{
	Object.defineProperty(target.prototype, 'hidden', {
			value: true,
			enumerable: true,
		});
		return target;
}

/**
 * Set an arbitrary value to an arbitrary key on a class
 */
function _setMetaData(key: string, value: any): any
{
	return function(target: any): any
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

/**
 * Apply a middleware function to the action method of a command.
 * Identical to `Command#use()` but used as a method decorator
 */
function using(func: MiddlewareFunction): MethodDecorator
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

export const CommandDecorators: { // tslint:disable-line
	using: (func: MiddlewareFunction) => MethodDecorator;

	name: (value: string) => any;
	aliases: (...value: string[]) => any;
	description: (value: string) => any;
	usage: (value: string) => any;
	extraHelp: (value: string) => any;
	group: (value: string) => any;
	argOpts: (value: ArgOpts) => any;
	permissions: (...value: PermissionResolvable[]) => any;
	roles: (...value: string[]) => any;
	ratelimit: (value: string) => any;
	overloads: (value: string) => any;
	ownerOnly: any;
	guildOnly: any;
	hidden: any;

	_setMetaData: (key: string, value: any) => any;
} = {
	using: using,

	name: name,
	aliases: aliases,
	description: description,
	usage: usage,
	extraHelp: extraHelp,
	group: group,
	argOpts: argOpts,
	permissions: permissions,
	roles: roles,
	ratelimit: ratelimit,
	overloads: overloads,
	ownerOnly: ownerOnly,
	guildOnly: guildOnly,
	hidden: hidden,

	_setMetaData: _setMetaData
};
