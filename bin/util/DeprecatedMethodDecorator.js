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
    if (typeof message !== 'string') {
        const [target, key] = decoratorArgs;
        message = `\`${target.constructor.name}#${key}()\` is deprecated and will be removed in a future release`;
        emitDeprecationWarning(message);
    }
    else {
        return function (target, key, descriptor) {
            if (!descriptor)
                descriptor = Object.getOwnPropertyDescriptor(target, key);
            const original = descriptor.value;
            descriptor.value = function (...args) {
                emitDeprecationWarning(message);
                return original.apply(this, args);
            };
            return descriptor;
        };
    }
}
exports.deprecatedMethod = deprecatedMethod;

//# sourceMappingURL=DeprecatedMethodDecorator.js.map
