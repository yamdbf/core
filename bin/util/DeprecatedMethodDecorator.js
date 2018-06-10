"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
/**
 * Logs a deprecation warning for the decorated class method
 * if it is called within the current process
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
function deprecatedMethod(...decoratorArgs) {
    let message = decoratorArgs[0];
    function decorate(target, key, descriptor) {
        if (!descriptor)
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        const original = descriptor.value;
        descriptor.value = function (...args) {
            Util_1.Util.emitDeprecationWarning(deprecatedMethod, message);
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
