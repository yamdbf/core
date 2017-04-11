import { Logger } from './Logger';

/**
 * Represents a type that has a `logger` property
 * containing the Logger singleton instance
 */
// export type Loggable<T> = T & { logger: Logger };

/**
 * Class decorator that transforms a class to Loggable<T>.
 * Regrettably works but is not properly picked up by intellisense
 * at this point in time, meaning compiler errors when attempting
 * to access the `logger` property on the decorated class.
 * Maybe someday.
 *
 * Example:
 * ```
 * &#64loggable
 * class Foo { }
 * ```
 */
// export function loggable<T extends Function>(target: T): Loggable<T>
// {
// 	Object.defineProperty(target.prototype, 'logger',
// 		{ value: Logger.instance });
// 	return <Loggable<T>> target;
// }

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
 */
export function logger<T>(target: T, key: string): void
{
	Object.defineProperty(target, 'logger',
		{ value: Logger.instance() });
}
