import { BaseCommandName } from '../types/BaseCommandName';

/**
 * Utility class containing handy static methods that can
 * be used anywhere
 * @module Util
 */
export class Util
{

	/**
	 * Tangible representation of all base command names
	 * @static
	 * @name baseCommandNames
	 * @type {BaseCommandName[]}
	 */
	public static baseCommandNames: BaseCommandName[] = require('./static/baseCommandNames.json');

	/**
	 * Pads the right side of a string with spaces to the given length
	 * @static
	 * @method padRight
	 * @param {string} text Text to pad
	 * @param {number} length Length to pad to
	 * @returns {string}
	 */
	public static padRight(text: string, length: number): string
	{
		let pad: number = Math.max(0, Math.min(length, length - text.length));
		return `${text}${' '.repeat(pad)}`;
	}

	/**
	 * Returns the given string lowercased with any non
	 * alphanumeric chars removed
	 * @static
	 * @method normalize
	 * @param {string} text Text to normalize
	 * @returns {string}
	 */
	public static normalize(text: string): string
	{
		return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
	}

	/**
	 * Assigns the given value along the given nested path within
	 * the provided initial object
	 * @static
	 * @method assignNestedValue
	 * @param {any} obj Object to assign to
	 * @param {string[]} path Nested path to follow within the object
	 * @param {any} value Value to assign within the object
	 * @returns {void}
	 */
	public static assignNestedValue(obj: any, path: string[], value: any): void
	{
		if (typeof obj !== 'object' || obj instanceof Array)
			throw new Error(`Initial input of type '${typeof obj}' is not valid for nested assignment`);

		if (path.length === 0)
			throw new Error('Missing nested assignment path');

		let first: string = path.shift();
		if (typeof obj[first] === 'undefined') obj[first] = {};
		if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
			throw new Error(`Target '${first}' is not valid for nested assignment.`);

		if (path.length === 0) obj[first] = value;
		else Util.assignNestedValue(obj[first], path, value);
	}

	/**
	 * Remove a value from within an object along a nested path
	 * @static
	 * @method removeNestedValue
	 * @param {any} obj Object to remove from
	 * @param {string[]} path Nested path to follow within the object
	 * @returns {void}
	 */
	public static removeNestedValue(obj: any, path: string[]): void
	{
		if (typeof obj !== 'object' || obj instanceof Array) return;
		if (path.length === 0)
			throw new Error('Missing nested assignment path');

		let first: string = path.shift();
		if (typeof obj[first] === 'undefined') return;
		if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
			return;

		if (path.length === 0) delete obj[first];
		else Util.removeNestedValue(obj[first], path);
	}

	/**
	 * Fetches a nested value from within an object via the
	 * provided path
	 * @static
	 * @method getNestedValue
	 * @param {any} obj Object to search
	 * @param {string[]} path Nested path to follow within the object
	 * @returns {any}
	 */
	public static getNestedValue(obj: any, path: string[]): any
	{
		if (typeof obj === 'undefined') return;
		if (path.length === 0) return obj;

		let first: string = path.shift();
		if (typeof obj[first] === 'undefined') return;
		if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
			return;

		return Util.getNestedValue(obj[first], path);
	}

	/**
	 * Converts a TypeScript-style argument list into a valid args data object
	 * for [resolve]{@link module:Middleware.resolve} and [expect]{@link module:Middleware.expect}.
	 * This can help if the object syntax for resolving/expecting Command
	 * arguments is too awkward or cluttered, or if a simpler syntax is
	 * overall preferred.
	 *
	 * Args marked with `?` (for example: `arg?: String`) are declared as
	 * optional and will be converted to `'[arg]': 'String'` at runtime.
	 * Normal args will convert to `'<arg>': 'String'`
	 *
	 * Example:
	 * ```
	 * `user: User, height: ['short', 'tall'], ...desc?: String`
	 * // becomes:
	 * { '<user>': 'User', '<height>': ['short', 'tall'], '[...desc]': 'String' }
	 * ```
	 *
	 * When specifying argument types for [resolve]{@link module:Middleware.resolve},
	 * use `String` when you know you will be later giving a string literal array to
	 * [expect]{@link module:Middleware.expect} for the corresponding arg
	 * @static
	 * @method parseArgTypes
	 * @param {string} input Argument list string
	 * @returns {object}
	 */
	public static parseArgTypes(input: string): { [arg: string]: string | string[] }
	{
		let argStringRegex: RegExp = /(?:\.\.\.)?\w+\?? *: *(?:\[.*?\](?= *, *)|(?:\[.*?\] *$)|\w+)/g;
		if (!argStringRegex.test(input))
			throw new Error(`Input string is incorrectly formatted: ${input}`);

		let output: { [arg: string]: string | string[] } = {};
		let args: string[] = input.match(argStringRegex);
		for (let arg of args)
		{
			let split: string[] = arg.split(':').map(a => a.trim());
			let name: string = split.shift();
			arg = split.join(':');
			if (/(?:\.\.\.)?.+\?/.test(name)) name = `[${name.replace('?', '')}]`;
			else name = `<${name}>`;

			if (/\[ *(?:(?: *, *)?(['"])(\S+)\1)+ *\]|\[ *\]/.test(arg))
			{
				let data: string = arg.match(/\[(.*)\]/)[1];
				if (!data) throw new Error('String literal array cannot be empty');
				let values: string[] = data
					.split(',')
					.map(a => a.trim())
					.map(a => a.slice(1, a.length - 1));
				output[name] = values;
			}
			else output[name] = arg;
		}
		return output;
	}
}
