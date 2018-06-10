"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Time_1 = require("./Time");
/**
 * Utility class containing handy static methods that can
 * be used anywhere
 * @module Util
 */
class Util {
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
    static async wasCommandCalled(message) {
        const client = message.client;
        const dm = message.channel.type !== 'text';
        const prefixes = [
            `<@${client.user.id}>`,
            `<@!${client.user.id}>`
        ];
        const guildStorage = !dm
            ? message.guild.storage || client.storage.guilds.get(message.guild.id)
            : null;
        if (!dm)
            prefixes.push(await guildStorage.settings.get('prefix'));
        else
            prefixes.push(await client.storage.get('defaultGuildSettings.prefix'));
        let prefix = prefixes.find(a => message.content.trim().startsWith(a));
        if (dm && typeof prefix === 'undefined')
            prefix = '';
        if (!dm && typeof prefix === 'undefined')
            return [false, null, prefix, null];
        const commandName = message.content.trim().slice(prefix.length).trim().split(' ')[0];
        const command = client.commands.resolve(commandName);
        if (!command)
            return [false, null, prefix, commandName];
        if (command.disabled)
            return [false, command, prefix, commandName];
        return [true, command, prefix, commandName];
    }
    /**
     * Split args from the input by the given Command's argument separator
     * @static
     * @method parseArgs
     * @param {string} input Input string to parse args from
     * @param {Command} [command] Command object, used to determine the args separator.
     * 							  If none is given, `' '` will be used as the separator
     * @returns {string[]}
     */
    static parseArgs(input, command) {
        return input
            .split((command && command.argOpts && command.argOpts.separator) || ' ')
            .map(a => a.trim())
            .filter(a => a !== '');
    }
    /**
     * Pads the right side of a string with spaces to the given length
     * @static
     * @method padRight
     * @param {string} text Text to pad
     * @param {number} length Length to pad to
     * @returns {string}
     */
    static padRight(text, length) {
        let pad = Math.max(0, Math.min(length, length - text.length));
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
    static normalize(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }
    /**
     * Returns the given string with special characters escaped
     * @static
     * @method escape
     * @param {string} input String to escape
     * @returns {string}
     */
    static escape(input) {
        return input.replace(/[[\](){}|\\^$+\-*?.]/g, '\\$&');
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
    static assignNestedValue(obj, path, value) {
        if (typeof obj !== 'object' || obj instanceof Array)
            throw new Error(`Initial input of type '${typeof obj}' is not valid for nested assignment`);
        if (path.length === 0)
            throw new Error('Missing nested assignment path');
        let first = path.shift();
        if (typeof obj[first] === 'undefined')
            obj[first] = {};
        if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
            throw new Error(`Target '${first}' is not valid for nested assignment.`);
        if (path.length === 0)
            obj[first] = value;
        else
            Util.assignNestedValue(obj[first], path, value);
    }
    /**
     * Remove a value from within an object along a nested path
     * @static
     * @method removeNestedValue
     * @param {any} obj Object to remove from
     * @param {string[]} path Nested path to follow within the object
     * @returns {void}
     */
    static removeNestedValue(obj, path) {
        if (typeof obj !== 'object' || obj instanceof Array)
            return;
        if (path.length === 0)
            throw new Error('Missing nested assignment path');
        let first = path.shift();
        if (typeof obj[first] === 'undefined')
            return;
        if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
            return;
        if (path.length === 0)
            delete obj[first];
        else
            Util.removeNestedValue(obj[first], path);
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
    static getNestedValue(obj, path) {
        if (typeof obj === 'undefined')
            return;
        if (path.length === 0)
            return obj;
        let first = path.shift();
        if (typeof obj[first] === 'undefined')
            return;
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
     * @static
     * @method parseArgTypes
     * @param {string} input Argument list string
     * @returns {object}
     */
    static parseArgTypes(input) {
        let argStringRegex = /(?:\.\.\.)?\w+\?? *: *(?:\[.*?\](?= *, *)|(?:\[.*?\] *$)|\w+)/g;
        if (!argStringRegex.test(input))
            throw new Error(`Input string is incorrectly formatted: ${input}`);
        let output = {};
        let args = input.match(argStringRegex);
        for (let arg of args) {
            let split = arg.split(':').map(a => a.trim());
            let name = split.shift();
            arg = split.join(':');
            if (/(?:\.\.\.)?.+\?/.test(name))
                name = `[${name.replace('?', '')}]`;
            else
                name = `<${name}>`;
            if (/\[ *(?:(?: *, *)?(['"])(\S+)\1)+ *\]|\[ *\]/.test(arg)) {
                const data = arg.match(/\[(.*)\]/)[1];
                if (!data)
                    throw new Error('String literal array cannot be empty');
                const values = data
                    .split(',')
                    .map(a => a.trim().slice(1, -1));
                output[name] = values;
            }
            else
                output[name] = arg;
        }
        return output;
    }
    /**
     * Parse a ratelimit Tuple from the given shorthand string
     * @param {string} limitString Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
     * 						 	   **Example:** `1/10m` to limit a command to one use per 10 minutes
     */
    static parseRateLimit(limitString) {
        const limitRegex = /^(\d+)\/(\d+)(s|m|h|d)?$/;
        if (!limitRegex.test(limitString))
            throw new Error(`Failed to parse a ratelimit from '${limitString}'`);
        let [limit, duration, post] = limitRegex.exec(limitString).slice(1, 4);
        if (post)
            duration = Time_1.Time.parseShorthand(duration + post);
        else
            duration = parseInt(duration);
        limit = parseInt(limit);
        return [limit, duration];
    }
    /**
     * Implementation of `performance-now`
     * @static
     * @method now
     * @returns {number}
     */
    static now() {
        const ns = (hr = process.hrtime()) => hr[0] * 1e9 + hr[1];
        return (ns() - (ns() - (process.uptime() * 1e9))) / 1e6;
    }
    /**
     * Flatten an array that may contain nested arrays
     * @static
     * @method flattenArray
     * @param {any[]} array
     * @returns {any[]}
     */
    static flattenArray(array) {
        const result = [];
        for (const item of array)
            item instanceof Array
                ? result.push(...Util.flattenArray(item))
                : result.push(item);
        return result;
    }
    /**
     * Emit a deprecation warning message for the given target
     * @static
     * @method emitDeprecationWarning
     * @param {any} target Deprecation target
     * @param {string} message Deprecation message
     * @returns {void}
     */
    static emitDeprecationWarning(target, message) {
        if (typeof target._warnCache === 'undefined')
            Object.defineProperty(target, '_warnCache', { value: {} });
        const warnCache = target._warnCache;
        if (warnCache[message])
            return;
        warnCache[message] = true;
        process.emitWarning(message, 'DeprecationWarning');
    }
}
/**
 * Tangible representation of all base command names
 * @static
 * @name baseCommandNames
 * @type {BaseCommandName[]}
 */
Util.baseCommandNames = require('./static/baseCommandNames.json');
exports.Util = Util;

//# sourceMappingURL=Util.js.map
