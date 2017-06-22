import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ResolveArgType } from '../../types/ResolveArgType';
import { ExpectArgType } from '../../types/ExpectArgType';
import { Client } from '../../client/Client';
import { localize } from './Localize';
import { Command } from '../Command';
import { resolve } from './Resolve';
import { expect } from './Expect';

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
	 * @method resolve
	 * @param {object} argTypes An object of argument names mapped to argument types<br>
	 * 							See: {@link ResolveArgType}
	 * @returns {MiddlewareFunction} ```
	 * (message: Message, args: any[]) => [Message, any[]]
	 * ```
	 */
	public static resolve: (argTypes: { [name: string]: ResolveArgType }) =>
		MiddlewareFunction = resolve;

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
	public static expect: (argTypes: { [name: string]: ExpectArgType }) =>
		MiddlewareFunction = expect;

	/**
	 * Middleware function that inserts a {@link ResourceLoader} function for the
	 * language that will be used for the command call as the first arg for that
	 * command call. This middleware should be used *after* any other middleware
	 * like `expect` or `resolve` because those are based around user input whereas
	 * this should be handled after user input related things as to not interfere
	 * with the other middleware and their input
	 * @method localize
	 * @returns {MiddlewareFunction}
	 */
	public static localize: MiddlewareFunction = localize;
}
