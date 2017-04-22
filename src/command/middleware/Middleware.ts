import { Client } from '../../client/Client';
import { Command } from '../Command';
import { expect } from './Expect';
import { resolveArgs } from './ResolveArgs';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ResolveArgType } from '../../types/ResolveArgType';
import { ExpectArgType } from '../../types/ExpectArgType';

/**
 * Contains static command middleware methods
 * @module Middleware
 */
export class Middleware
{
	/**
	 * Takes an object mapping argument names to argument types that
	 * resolves args to their specified type or throws errors for
	 * any invalid input.
	 *
	 * Valid types are:
	 * ```
	 * 'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Role' | 'Channel'
	 * ```
	 * Example:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<...desc>': 'String' }
	 * ```
	 *
	 * Supports `'...'` in the argument name as the final argument to gather
	 * all remaining words into one string and attempt to resolve them to
	 * the provided argument type
	 * @method resolveArgs
	 * @param {object} argTypes An object of argument names mapped to argument types<br>
	 * 							See: {@link ResolveArgType}
	 * @returns {MiddlewareFunction} ```
	 * (message: Message, args: any[]) => [Message, any[]]
	 * ```
	 */
	public static resolveArgs: <T extends Client, U extends Command<T>>(argTypes: { [name: string]: ResolveArgType }) =>
		MiddlewareFunction = resolveArgs;

	/**
	 * Takes an object mapping argument names to argument types that
	 * checks the types of passed arguments and ensures required
	 * arguments are present and valid. Should be added to the
	 * command AFTER any and all middleware functions that modify
	 * args in any way are added.
	 *
	 * Valid types are:
	 * ```
	 * 'String' | 'Number' | 'User' | 'Member' | 'Role' | 'Channel' | 'Any'
	 * ```
	 * Example:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<desc>': 'String' }
	 * ```
	 *
	 * If verifying a `BannedUser` returned from the ResolveArgs middleware,
	 * use the `User` type. If verifying `Duration` type, `Number` should be used.
	 *
	 * This middleware does not modify args in any way.
	 * @method expect
	 * @param {object} argTypes An object of argument names mapped to argument types<br>
	 * 							See: {@link ExpectArgType}
	 * @returns {MiddlewareFunction} ```
	 * (message: Message, args: any[]) => [Message, any[]]
	 * ```
	 */
	public static expect: <T extends Client, U extends Command<T>>(argTypes: { [name: string]: ExpectArgType }) =>
		MiddlewareFunction = expect;
}
