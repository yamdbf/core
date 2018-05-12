"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logs a deprecation warning for the decorated class if
 * an instance is created
 * @param {string} [message] Class deprecation message
 * @returns {ClassDecorator}
 */
function deprecatedClass(...decoratorArgs) {
    if (typeof deprecatedClass.warnCache === 'undefined')
        deprecatedClass.warnCache = {};
    const warnCache = deprecatedClass.warnCache;
    let message = decoratorArgs[0];
    function emitDeprecationWarning(warning) {
        if (warnCache[warning])
            return;
        warnCache[warning] = true;
        process.emitWarning(warning, 'DeprecationWarning');
    }
    function decorate(target) {
        return class extends target {
            constructor(...args) {
                emitDeprecationWarning(message);
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
