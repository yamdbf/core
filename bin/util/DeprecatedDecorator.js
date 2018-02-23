"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./logger/Logger");
/**
 * Logs a deprecation warning for the decorated class method
 * whenever it is called
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
function deprecated(message) {
    return function (target, key, descriptor) {
        if (!descriptor)
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        const original = descriptor.value;
        const logger = Logger_1.Logger.instance('Deprecation');
        descriptor.value = function (...args) {
            logger.warn(message || `${target.constructor.name}#${key}() is deprecated and will be removed in a future release.`);
            return original.apply(this, args);
        };
        return descriptor;
    };
}
exports.deprecated = deprecated;

//# sourceMappingURL=DeprecatedDecorator.js.map
