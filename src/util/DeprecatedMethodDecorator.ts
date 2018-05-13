export function deprecatedMethod(message: string): MethodDecorator;
export function deprecatedMethod(target: object, key: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor;
/**
 * Logs a deprecation warning for the decorated class method
 * if it is called within the current process
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
export function deprecatedMethod(...decoratorArgs: any[]): MethodDecorator | PropertyDescriptor
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

	function decorate(target: object, key: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor
	{
		if (!descriptor) descriptor = Object.getOwnPropertyDescriptor(target, key);
		const original: any = descriptor.value;
		descriptor.value = function(...args: any[]): any
		{
			emitDeprecationWarning(message);
			return original.apply(this, args);
		};
		return descriptor;
	}

	if (typeof message !== 'string')
	{
		const [target, key, descriptor]: [object, PropertyKey, PropertyDescriptor] = decoratorArgs as any;
		message = `\`${target.constructor.name}#${key}()\` is deprecated and will be removed in a future release`;
		return decorate(target, key, descriptor);
	}
	else return decorate;
}
