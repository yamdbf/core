import { BaseCommandName } from '../types/BaseCommandName';
import { Message } from '../types/Message';
import { Command } from '../command/Command';
/**
 * Utility class containing handy static methods that can
 * be used anywhere
 * @module Util
 */
export declare class Util {
    /**
     * Tangible representation of all base command names
     * @static
     * @name baseCommandNames
     * @type {BaseCommandName[]}
     */
    static baseCommandNames: BaseCommandName[];
    /**
     * Return whether or not a command was called in the given
     * message, the called command, the prefix used to call the
     * command, and the name or alias of the command used to call it.
     * >Returns everything it manages to determine up to the point of failure
     * @static
     * @method wasCommandCalled
     * @param {Message} message Message to check
     * @returns {Promise<Tuple<boolean, Command | null, string, string | null>>}
     */
    static wasCommandCalled(message: Message): Promise<[boolean, Command | null, string, string | null]>;
    /**
     * Split args from the input by the given Command's argument separator
     * @static
     * @method parseArgs
     * @param {string} input Input string to parse args from
     * @param {Command} [command] Command object, used to determine the args separator.
     * 							  If none is given, `' '` will be used as the separator
     * @returns {string[]}
     */
    static parseArgs(input: string, command?: Command): string[];
    /**
     * Pads the right side of a string with spaces to the given length
     * @static
     * @method padRight
     * @param {string} text Text to pad
     * @param {number} length Length to pad to
     * @returns {string}
     */
    static padRight(text: string, length: number): string;
    /**
     * Returns the given string lowercased with any non
     * alphanumeric chars removed
     * @static
     * @method normalize
     * @param {string} text Text to normalize
     * @returns {string}
     */
    static normalize(text: string): string;
    /**
     * Returns the given string with special characters escaped
     * @static
     * @method escape
     * @param {string} input String to escape
     * @returns {string}
     */
    static escape(input: string): string;
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
    static assignNestedValue(obj: any, path: string[], value: any): void;
    /**
     * Remove a value from within an object along a nested path
     * @static
     * @method removeNestedValue
     * @param {any} obj Object to remove from
     * @param {string[]} path Nested path to follow within the object
     * @returns {void}
     */
    static removeNestedValue(obj: any, path: string[]): void;
    /**
     * Fetches a nested value from within an object via the
     * provided path
     * @static
     * @method getNestedValue
     * @param {any} obj Object to search
     * @param {string[]} path Nested path to follow within the object
     * @returns {any}
     */
    static getNestedValue(obj: any, path: string[]): any;
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
     * @static
     * @method parseArgTypes
     * @param {string} input Argument list string
     * @returns {object}
     */
    static parseArgTypes(input: string): {
        [arg: string]: string | string[];
    };
    /**
     * Parse a ratelimit Tuple from the given shorthand string
     * @param {string} limitString Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
     * 						 	   **Example:** `1/10m` to limit a command to one use per 10 minutes
     */
    static parseRateLimit(limitString: string): [number, number];
    /**
     * Implementation of `performance-now`
     * @static
     * @method now
     * @returns {number}
     */
    static now(): number;
    /**
     * Flatten an array that may contain nested arrays
     * @static
     * @method flattenArray
     * @param {any[]} array
     * @returns {any[]}
     */
    static flattenArray<T>(array: (T | T[])[]): T[];
    /**
     * Emit a deprecation warning message for the given target
     * @static
     * @method emitDeprecationWarning
     * @param {any} target Deprecation target
     * @param {string} message Deprecation message
     * @returns {void}
     */
    static emitDeprecationWarning(target: any, message: string): void;
}
