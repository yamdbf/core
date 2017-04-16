import { Logger } from './logger/Logger';
const logger: Logger = Logger.instance();

/**
 * Logs a deprecation warning for the decorated class method
 * whenever it is called
 * @private
 * @param {string} [message] Method deprecation message
 */
export function deprecated<T extends Function>(message?: string): MethodDecorator
{
	return function(target: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor
	{
		if (!descriptor) descriptor = Object.getOwnPropertyDescriptor(target, key);
		const original: any = descriptor.value;
		descriptor.value = function(...args: any[]): any
		{
			logger.warn('Deprecation', message || `${target.constructor.name}#${key}() is deprecated and will be removed in a future release.`);
			return original.apply(this, args);
		};
		return descriptor;
	};
}
