export function deprecatedMethod(message: string): MethodDecorator;
export function deprecatedMethod<T>(target: T, key: PropertyKey): void;
/**
 * Logs a deprecation warning for the decorated class method
 * if it is called within the current process
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
export function deprecatedMethod<T extends Function>(...decoratorArgs: any[]): any
{
	if (typeof (deprecatedMethod as any).warnCache === 'undefined') (deprecatedMethod as any).warnCache = {};
	const warnCache: { [key: string]: boolean } = (deprecatedMethod as any).warnCache;
	let message: string = decoratorArgs[0];

	function emitDeprecationWarning(warning: string): void
	{
		if (warnCache[warning]) return;
		warnCache[warning] = true;
		process.emitWarning(warning, 'DeprecationWarning');
	}

	if (typeof message !== 'string')
	{
		const [target, key]: [T, PropertyKey] = decoratorArgs as any;
		message = `\`${target.constructor.name}#${key}()\` is deprecated and will be removed in a future release`;
		emitDeprecationWarning(message);
	}
	else
	{
		return function(target: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor
		{
			if (!descriptor) descriptor = Object.getOwnPropertyDescriptor(target, key);
			const original: any = descriptor.value;
			descriptor.value = function(...args: any[]): any
			{
				emitDeprecationWarning(message);
				return original.apply(this, args);
			};
			return descriptor;
		};
	}
}
