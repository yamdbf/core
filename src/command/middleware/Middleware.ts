import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { resolve, MappedResolveArgType } from './Resolve';
import { expect, MappedExpectArgType } from './Expect';
import { localize } from './Localize';

/**
 * Contains static command middleware methods
 * @module Middleware
 */
export class Middleware
{
	/**
	 * Takes an object mapping argument names to argument types that
	 * resolves args to their specified type or throws errors for
	 * any invalid input. An argument list string can also be used --
	 * See [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * for an example of how the list should be formatted
	 *
	 * See {@link ResolveArgType} for information on valid types.
	 *
	 * Example:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<...desc>': 'String' }
	 * ```
	 *
	 * Supports `'...'` in the argument name as the final argument to gather
	 * all remaining input into one string and attempt to resolve them to
	 * the provided argument type
	 *
	 * >**Note:** If you are using a string literal array type with
	 * [expect]{@link module:Middleware.expect} alongside this, the
	 * corresponding type you should resolve for that arg before using
	 * `expect` is `String`
	 * @static
	 * @method resolve
	 * @param {object|string} argTypes An object of argument names mapped to argument types
	 * 								   or a TypeScript-style argument list string<br>
	 * 								   See: {@link ResolveArgType}<br>
	 * 								   See: [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * @returns {MiddlewareFunction}
	 */
	public static resolve: (argTypes: string | MappedResolveArgType) =>
		MiddlewareFunction = resolve;

	/**
	 * Takes an object mapping argument names to argument types that
	 * checks the types of passed arguments and ensures required
	 * arguments are present and valid. An argument list string
	 * can also be used -- See [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * for an example of how the list should be formatted
	 *
	 * Should be added to the command AFTER any and all middleware functions
	 * that modify args in any way are added ([resolve]{@link module:Middleware.resolve},
	 * for example), the only exception being [localize]{@link module:Middleware.localize},
	 * which should always come last.
	 *
	 * See {@link ExpectArgType} for information on valid types.
	 *
	 * Examples:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<desc>': 'String' }
	 * ```
	 * ```
	 * { '<height>': ['short', 'medium', 'tall'] }
	 * ```
	 *
	 * >**Note:** If verifying a `BannedUser` returned from [resolve]{@link module:Middleware.resolve},
	 * use the `User` type. If verifying a `Duration` type, use `Number`.
	 *
	 * ***This middleware does not modify args in any way.***
	 * @static
	 * @method expect
	 * @param {object|string} argTypes An object of argument names mapped to argument types
	 * 								   or a TypeScript-style argument list string<br>
	 * 								   See: {@link ExpectArgType}<br>
	 * 								   See: [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * @returns {MiddlewareFunction}
	 */
	public static expect: (argTypes: string | MappedExpectArgType) =>
		MiddlewareFunction = expect;

	/**
	 * Middleware function that inserts a {@link ResourceLoader} function for the
	 * language that will be used for the command call as the first arg for that
	 * command call. This middleware should be used *after* any other middleware
	 * like [expect]{@link module:Middleware.expect} or [resolve]{@link module:Middleware.resolve}
	 * because those are based around user input whereas this should be handled
	 * after user input related things as to not interfere with the other middleware
	 * and their inputs
	 * @static
	 * @method localize
	 * @returns {MiddlewareFunction}
	 */
	public static localize: MiddlewareFunction = localize;
}
