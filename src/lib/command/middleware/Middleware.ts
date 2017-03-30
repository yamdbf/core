import { Bot } from '../../bot/Bot';
import { Command } from '../Command';
import { expect } from './Expect';
import { resolveArgs } from './ResolveArgs';
import { MiddlewareFunction } from '../../types/MiddlewareFunction';
import { ResolveArgType } from '../../types/ResolveArgType';
import { ExpectArgType } from '../../types/ExpectArgType';

/**
 * Contains static command middleware methods
 * @class Middleware
 */
export class Middleware
{
	/**
	 * Takes an object mapping argument names to argument types that
	 * resolves args to their specified type or throws errors for
	 * any invalid input.<br><br>
	 *
	 * Valid types are:<br>
	 * <pre class="prettyprint"><code>'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Role' | 'Channel'</code></pre><br>
	 *
	 * Example:<br>
	 * <pre class="prettyprint"><code>{ 'mem': 'Member', 'age>': 'Number', '...desc': 'String' }
	 * </code></pre><br>
	 *
	 * Supports <code>'...'</code> in the argument name as the final argument to
	 * gather all remaining words into one string and attempt to resolve them to
	 * the provided argument type
	 * @name resolveArgs
	 * @method
	 * @memberof Middleware
	 * @param {object} argTypes An object of argument names mapped to argument types<br>
	 * 							See: {@link ResolveArgType}
	 * @returns {Function} <pre class="prettyprint"><code>(message: Message, args: any[]) => [Message, any[]]</code></pre>
	 */
	public static resolveArgs: <T extends Bot, U extends Command<T>>(argTypes: { [name: string]: ResolveArgType }) =>
		MiddlewareFunction = resolveArgs;

	/**
	 * Takes an object mapping argument names to argument types that
	 * checks the types of passed arguments and ensures required
	 * arguments are present and valid. Should be added to the
	 * command AFTER any and all middleware functions that modify
	 * args in any way are added.<br><br>
	 *
	 * Valid types are:<br>
	 * <pre class="prettyprint"><code>'String' | 'Number' | 'User' | 'Member' | 'Role' | 'Channel' | 'Any'</code></pre><br>
	 *
	 * Example:<br>
	 * <pre class="prettyprint"><code>{ 'mem': 'Member', 'age': 'Number', 'desc': 'String' }
	 * </code></pre><br>
	 *
	 * If verifying a `BannedUser` returned from the ResolveArgs middleware,
	 * use the `User` type. If verifying `Duration` type, `Number` should be used.
	 *
	 * This middleware does not modify args in any way.
	 * @name expect
	 * @method
	 * @memberof Middleware
	 * @param {object} argTypes An object of argument names mapped to argument types<br>
	 * 							See: {@link ExpectArgType}
	 * @returns {Function} <pre class="prettyprint"><code>(message: Message, args: any[]) => [Message, any[]]</code></pre>
	 */
	public static expect: <T extends Bot, U extends Command<T>>(argTypes: { [name: string]: ExpectArgType }) =>
		MiddlewareFunction = expect;
}
