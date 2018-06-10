import { ArgOpts } from '../types/ArgOpts';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { Command } from './Command';
import { PermissionResolvable } from 'discord.js';
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
export declare function using(func: MiddlewareFunction): MethodDecorator;
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
export declare function localizable(target: Command, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
/**
 * Set `name` metadata
 * @static
 * @method name
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function name(value: string): ClassDecorator;
/**
 * Set `aliases` metadata
 * @static
 * @method aliases
 * @param {...string} values Values to set
 * @returns {ClassDecorator}
 */
export declare function aliases(...values: string[]): ClassDecorator;
/**
 * Set `desc` metadata
 * @static
 * @method desc
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function desc(value: string): ClassDecorator;
/**
 * Set `usage` metadata
 * @static
 * @method usage
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function usage(value: string): ClassDecorator;
/**
 * Set `info` metadata
 * @static
 * @method info
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function info(value: string): ClassDecorator;
/**
 * Set `group` metadata
 * @static
 * @method group
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function group(value: string): ClassDecorator;
/**
 * Set `argOpts` metadata
 * @static
 * @method argOpts
 * @param {ArgOpts} value Value to set
 * @returns {ClassDecorator}
 */
export declare function argOpts(value: ArgOpts): ClassDecorator;
/**
 * Set `callerPermissions` metadata
 * @static
 * @method callerPermissions
 * @param {...external:PermissionResolvable} values Values to set
 * @returns {ClassDecorator}
 */
export declare function callerPermissions(...values: PermissionResolvable[]): ClassDecorator;
/**
 * Set `clientPermissions` metadata
 * @static
 * @method clientPermissions
 * @param {...external:PermissionResolvable} values Values to set
 * @returns {ClassDecorator}
 */
export declare function clientPermissions(...values: PermissionResolvable[]): ClassDecorator;
/**
 * Set `roles` metadata
 * @static
 * @method roles
 * @param {...string} values Values to set
 * @returns {ClassDecorator}
 */
export declare function roles(...values: string[]): ClassDecorator;
/**
 * Set `ratelimit` metadata
 * @static
 * @method ratelimit
 * @param {string} value Value to set
 * @returns {ClassDecorator}
 */
export declare function ratelimit(value: string): ClassDecorator;
/**
 * Set `owneronly` flag metadata
 * @static
 * @name ownerOnly
 * @type {ClassDecorator}
 */
export declare function ownerOnly<T extends Function>(target: T): T;
/**
 * Set `guildOnly` flag metadata
 * @static
 * @name guildOnly
 * @type {ClassDecorator}
 */
export declare function guildOnly<T extends Function>(target: T): T;
/**
 * Set `hidden` flag metadata
 * @static
 * @name hidden
 * @type {ClassDecorator}
 */
export declare function hidden<T extends Function>(target: T): T;
