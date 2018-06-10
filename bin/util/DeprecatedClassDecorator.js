"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
/**
 * Logs a deprecation warning for the decorated class if
 * an instance is created
 * @param {string} [message] Class deprecation message
 * @returns {ClassDecorator}
 */
function deprecatedClass(...decoratorArgs) {
    let message = decoratorArgs[0];
    function decorate(target) {
        return class extends target {
            constructor(...args) {
                Util_1.Util.emitDeprecationWarning(deprecatedClass, message);
                super(...args);
            }
        };
    }
    if (typeof message !== 'string') {
        const [target] = decoratorArgs;
        message = `Class \`${target.name}\` is deprecated and will be removed in a future release`;
        return decorate(target);
    }
    else
        return decorate;
}
exports.deprecatedClass = deprecatedClass;

//# sourceMappingURL=DeprecatedClassDecorator.js.map
