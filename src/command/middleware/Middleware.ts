import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { resolve, MappedArgType } from './Resolve';
import { expect } from './Expect';
import { localize } from './Localize';
import { localizeLoader } from './LocalizeLoader';

/**
 * Contains static command middleware methods
 * @module Middleware
 */
export class Middleware
{
	/**
	 * Takes an object mapping argument names to {@link Resolver} type names
	 * and resolves args to their specified type. An argument list string
	 * can also be used -- See [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * for an example of how the list should be formatted
	 *
	 * See {@link BaseResolverType} for a list of base Resolver type names.
	 *
	 * Example:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<desc>': 'String' }
	 * // or: 'mem: Member, age: Number, desc: String'
	 *
	 * // An array literal for expecting specific strings can also be used
	 * { '<height>': ['short', 'medium', 'tall'] }
	 * // or: `height: ['short', 'medium', 'tall']`
	 * ```
	 *
	 * Supports `'...'` in the argument name as the final argument to gather
	 * all remaining input into one string and attempt to resolve them to
	 * the provided argument type
	 * @static
	 * @method resolve
	 * @param {object|string} argTypes An object of argument names mapped to Resolver type names
	 * 								   or a TypeScript-style argument list string<br>
	 * 								   See: {@link BaseResolverType}<br>
	 * 								   See: [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * @returns {MiddlewareFunction}
	 */
	public static resolve: (argTypes: string | MappedArgType) => MiddlewareFunction = resolve;

	/**
	 * Takes an object mapping argument names to {@link Resolver} type names
	 * and checks the types of passed arguments, ensuring required
	 * arguments are present and valid. An argument list string
	 * can also be used -- See [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * for an example of how the list string should be formatted
	 *
	 * Should be added to the command AFTER any and all middleware functions
	 * that modify args in any way are added ([resolve]{@link module:Middleware.resolve},
	 * for example), an exception being [localize]{@link module:Middleware.localize},
	 * which should always come last.
	 *
	 * See {@link BaseResolverType} for a list of base Resolver type names.
	 *
	 * Examples:
	 * ```
	 * { '<mem>': 'Member', '<age>': 'Number', '<desc>': 'String' }
	 * // or: 'mem: Member, age: Number, desc: String'
	 *
	 * // An array literal for expecting specific strings can also be used
	 * { '<height>': ['short', 'medium', 'tall'] }
	 * // or: `height: ['short', 'medium', 'tall']`
	 * ```
	 *
	 * ***This middleware does not modify args in any way.***
	 * @static
	 * @method expect
	 * @param {object|string} argTypes An object of argument names mapped to Resolver type names
	 * 								   or a TypeScript-style argument list string<br>
	 * 								   See: {@link BaseResolverType}<br>
	 * 								   See: [Util.parseArgTypes]{@link module:Util.parseArgTypes}
	 * @returns {MiddlewareFunction}
	 */
	public static expect: (argTypes: string | MappedArgType) => MiddlewareFunction = expect;

	/**
	 * Middleware function that inserts a {@link ResourceProxy} object for the
	 * language that will be used for the command call as the first arg for that
	 * command call.
	 *
	 * >**Note:** The original `localize` middleware that inserted {@link ResourceLoader}
	 * functions into the command args has been moved to {@link module:Middleware.localizeLoader}
	 * temporarily, but `ResourceLoader` functions themselves are deprecated
	 * in favor of `ResourceProxy`. `ResourceLoader` and associated functionality
	 * will be removed in a future release, only being left in despite the major
	 * version bump of 4.0.0 to ease the transition
	 *
	 * >**Note:** This middleware should be used *after* any other middleware
	 * like [expect]{@link module:Middleware.expect} or [resolve]{@link module:Middleware.resolve}
	 * because those are based around user input whereas this should be handled
	 * after user input related things as to not interfere with the other middleware
	 * and their inputs
	 * @static
	 * @method localize
	 * @returns {MiddlewareFunction}
	 */
	public static localize: MiddlewareFunction = localize;

	/**
	 * Middleware function that inserts a {@link ResourceLoader} function for the
	 * language that will be used for the command call as the first arg for that
	 * command call.
	 *
	 * >**Note:** This middleware should be used *after* any other middleware
	 * like [expect]{@link module:Middleware.expect} or [resolve]{@link module:Middleware.resolve}
	 * because those are based around user input whereas this should be handled
	 * after user input related things as to not interfere with the other middleware
	 * and their inputs
	 * @deprecated Use [localize]{@link module:Middleware.localize} instead.
	 * @static
	 * @method localizeLoader
	 * @returns {MiddlewareFunction}
	 */
	public static localizeLoader: MiddlewareFunction = localizeLoader;
}
