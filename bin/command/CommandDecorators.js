"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lang_1 = require("../localization/Lang");
const Util_1 = require("../util/Util");
const CompactModeHelper_1 = require("./CompactModeHelper");
/**
 * Grouping of static decorator methods for the {@link Command}
 * class and {@link Command#action} method
 *
 * >**Note:** This is a TypeScript feature. JavaScript users are limited to
 * using CommandInfo to define their commands and {@link Command#use} for
 * assigning middleware functions to commands
 * @module CommandDecorators
 */
/**
 * Apply a middleware function to the action method of a Command.
 * Identical to {@link Command#use} but used as a Command action
 * method decorator
 * @static
 * @method using
 * @param {MiddlewareFunction} func Middleware function to use
 * 									for the decorated Command action
 * @returns {MethodDecorator}
 */
function using(func) {
    return function (target, key, descriptor) {
        if (!target)
            throw new Error('@using must be used as a method decorator for a Command action method.');
        if (key !== 'action')
            throw new Error(`"${target.constructor.name}#${key}" is not a valid method target for @using.`);
        if (!descriptor)
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        const original = descriptor.value;
        descriptor.value = async function (message, args) {
            // Send the middleware result to the channel, utilizing compact mode if enabled
            const sendMiddlewareResult = async (result, options) => {
                if (await message.guild.storage.settings.get('compact') || this.client.compact) {
                    if (message.reactions.size > 0)
                        await message.reactions.removeAll();
                    return CompactModeHelper_1.CompactModeHelper.registerButton(message, this.client.buttons['fail'], () => message.channel.send(result, options));
                }
                else
                    return message.channel.send(result);
            };
            // Run the given middleware function
            let middlewarePassed = true;
            try {
                let result = func.call(this, message, args);
                if (result instanceof Promise)
                    result = await result;
                if (!(result instanceof Array)) {
                    if (typeof result === 'string')
                        sendMiddlewareResult(result);
                    middlewarePassed = false;
                }
                if (middlewarePassed)
                    [message, args] = result;
            }
            catch (err) {
                sendMiddlewareResult(err.toString(), { split: true });
                middlewarePassed = false;
            }
            if (middlewarePassed)
                return await original.apply(this, [message, args]);
        };
        return descriptor;
    };
}
exports.using = using;
/**
 * Creates a {@link ResourceProxy} object using the localization
 * language for the command call and passes it as the first argument
 * for that command call.
 *
 * Identical to [localize]{@link module:Middleware.localize} but used
 * as a Command action method decorator.
 *
 * Like the `localize` middleware, you will want to use this after
 * any other usages of middleware via [@using()]{@link module:CommandDecorators.using}.
 * Middleware added via {@link Command#use} is evaluated before
 * middleware added via `@using()`.
 * @deprecated in favor of [localize]{@link module:Middleware.localize}. Will be removed in a future release
 * @static
 * @name localizable
 * @type {MethodDecorator}
 */
function localizable(target, key, descriptor) {
    Util_1.Util.emitDeprecationWarning(localizable, '`CommandDecorators.localizable` is deprecated. Use `Middleware.localize` instead');
    if (!target)
        throw new Error('@localizable must be used as a method decorator for a Command action method.');
    if (key !== 'action')
        throw new Error(`"${target.constructor.name}#${key}" is not a valid method target for @localizable.`);
    if (!descriptor)
        descriptor = Object.getOwnPropertyDescriptor(target, key);
    const original = descriptor.value;
    descriptor.value = async function (message, args) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        return await original.apply(this, [message, [res, ...args]]);
    };
    return descriptor;
}
exports.localizable = localizable;
/**
 * Set `name` metadata
 * @static
 * @method name
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function name(value) {
    return _setMetaData('name', value);
}
exports.name = name;
/**
 * Set `aliases` metadata
 * @static
 * @method aliases
 * @param {...string} values Values to set
 * @returns {ClassDecorator}
 */
function aliases(...values) {
    return _setMetaData('aliases', values);
}
exports.aliases = aliases;
/**
 * Set `desc` metadata
 * @static
 * @method desc
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function desc(value) {
    return _setMetaData('desc', value);
}
exports.desc = desc;
/**
 * Set `usage` metadata
 * @static
 * @method usage
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function usage(value) {
    return _setMetaData('usage', value);
}
exports.usage = usage;
/**
 * Set `info` metadata
 * @static
 * @method info
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function info(value) {
    return _setMetaData('info', value);
}
exports.info = info;
/**
 * Set `group` metadata
 * @static
 * @method group
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function group(value) {
    return _setMetaData('group', value);
}
exports.group = group;
/**
 * Set `argOpts` metadata
 * @static
 * @method argOpts
 * @param {ArgOpts} value Value to set
 * @returns {ClassDecorator}
 */
function argOpts(value) {
    return _setMetaData('usage', value);
}
exports.argOpts = argOpts;
/**
 * Set `callerPermissions` metadata
 * @static
 * @method callerPermissions
 * @param {...external:PermissionResolvable} values Values to set
 * @returns {ClassDecorator}
 */
function callerPermissions(...values) {
    return _setMetaData('callerPermissions', values);
}
exports.callerPermissions = callerPermissions;
/**
 * Set `clientPermissions` metadata
 * @static
 * @method clientPermissions
 * @param {...external:PermissionResolvable} values Values to set
 * @returns {ClassDecorator}
 */
function clientPermissions(...values) {
    return _setMetaData('clientPermissions', values);
}
exports.clientPermissions = clientPermissions;
/**
 * Set `roles` metadata
 * @static
 * @method roles
 * @param {...string} values Values to set
 * @returns {ClassDecorator}
 */
function roles(...values) {
    return _setMetaData('roles', values);
}
exports.roles = roles;
/**
 * Set `ratelimit` metadata
 * @static
 * @method ratelimit
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
function ratelimit(value) {
    Util_1.Util.parseRateLimit(value);
    return _setMetaData('_ratelimit', value);
}
exports.ratelimit = ratelimit;
/**
 * Set `owneronly` flag metadata
 * @static
 * @name ownerOnly
 * @type {ClassDecorator}
 */
function ownerOnly(target) {
    return _setFlagMetaData(target, 'ownerOnly');
}
exports.ownerOnly = ownerOnly;
/**
 * Set `guildOnly` flag metadata
 * @static
 * @name guildOnly
 * @type {ClassDecorator}
 */
function guildOnly(target) {
    return _setFlagMetaData(target, 'guildOnly');
}
exports.guildOnly = guildOnly;
/**
 * Set `hidden` flag metadata
 * @static
 * @name hidden
 * @type {ClassDecorator}
 */
function hidden(target) {
    return _setFlagMetaData(target, 'hidden');
}
exports.hidden = hidden;
/**
 * Set a boolean flag metadata on a command class
 * @private
 */
function _setFlagMetaData(target, flag) {
    Object.defineProperty(target.prototype, flag, {
        value: true,
        enumerable: true,
    });
    return target;
}
/**
 * Set an arbitrary value to an arbitrary key on a command class
 * @private
 */
function _setMetaData(key, value) {
    return function (target) {
        Object.defineProperty(target.prototype, key, {
            value: value,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return target;
    };
}

//# sourceMappingURL=CommandDecorators.js.map
