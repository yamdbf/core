"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
/**
 * Property decorator that will automatically assign
 * the Logger singleton instance to the decorated
 * class property
 *
 * Example:
 * ```
 * class Foo {
 * 	&#64logger private readonly logger: Logger;
 * 	...
 * ```
 * >**Note:** This is a Typescript feature. If using the logger is desired
 * in Javascript you should simply retrieve the singleton instance via
 * `Logger.instance()`
 * @returns {PropertyDecorator}
 */
function logger(...args) {
    if (typeof args[0] === 'string')
        return (target, key) => {
            Object.defineProperty(target, key, { value: Logger_1.Logger.instance(args[0]) });
        };
    Object.defineProperty(args[0], args[1], { value: Logger_1.Logger.instance() });
}
exports.logger = logger;

//# sourceMappingURL=LoggerDecorator.js.map
