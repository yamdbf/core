"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logs a deprecation warning for the decorated class method
 * if it is called within the current process
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
function deprecatedMethod(...decoratorArgs) {
    if (typeof deprecatedMethod.warnCache === 'undefined')
        deprecatedMethod.warnCache = {};
    const warnCache = deprecatedMethod.warnCache;
    let message = decoratorArgs[0];
    function emitDeprecationWarning(warning) {
        if (warnCache[warning])
            return;
        warnCache[warning] = true;
        process.emitWarning(warning, 'DeprecationWarning');
    }
    function decorate(target, key, descriptor) {
        if (!descriptor)
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        const original = descriptor.value;
        descriptor.value = function (...args) {
            emitDeprecationWarning(message);
            return original.apply(this, args);
        };
        return descriptor;
    }
    if (typeof message !== 'string') {
        const [target, key, descriptor] = decoratorArgs;
        message = `\`${target.constructor.name}#${key}()\` is deprecated and will be removed in a future release`;
        return decorate(target, key, descriptor);
    }
    else
        return decorate;
}
exports.deprecatedMethod = deprecatedMethod;

//# sourceMappingURL=DeprecatedMethodDecorator.js.map
