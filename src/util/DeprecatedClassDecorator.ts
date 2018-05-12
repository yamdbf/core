export function deprecatedClass(message: string): ClassDecorator;
export function deprecatedClass<T>(target: T): T;
/**
 * Logs a deprecation warning for the decorated class if
 * an instance is created
 * @param {string} [message] Class deprecation message
 * @returns {ClassDecorator}
 */
export function deprecatedClass<T extends new (...args: any[]) => any>(...decoratorArgs: any[]): any
{
	if (typeof (deprecatedClass as any).warnCache === 'undefined') (deprecatedClass as any).warnCache = {};
	const warnCache: { [key: string]: boolean } = (deprecatedClass as any).warnCache;
	let message: string = decoratorArgs[0];

	function emitDeprecationWarning(warning: string): void
	{
		if (warnCache[warning]) return;
		warnCache[warning] = true;
		process.emitWarning(warning, 'DeprecationWarning');
	}

	function decorate(target: T): T
	{
		return class extends target
		{
			public constructor(...args: any[])
			{
				emitDeprecationWarning(message);
				super(...args);
			}
		};
	}

	if (typeof message !== 'string')
	{
		const [target]: [T] = decoratorArgs as any;
		message = `Class \`${target.name}\` is deprecated and will be removed in a future release`;

		return decorate(target);
	}
	else return decorate;
}
