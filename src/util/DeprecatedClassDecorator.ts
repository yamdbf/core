import { Util } from './Util';

export function deprecatedClass(message: string): ClassDecorator;
export function deprecatedClass<T extends new (...args: any[]) => any>(target: T): T;
/**
 * Logs a deprecation warning for the decorated class if
 * an instance is created
 * @param {string} [message] Class deprecation message
 * @returns {ClassDecorator}
 */
export function deprecatedClass<T extends new (...args: any[]) => any>(...decoratorArgs: any[]): ClassDecorator | T
{
	let message: string = decoratorArgs[0];

	function decorate(target: T): T
	{
		return class extends target
		{
			public constructor(...args: any[])
			{
				Util.emitDeprecationWarning(deprecatedClass, message);
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
	else return decorate as ClassDecorator;
}
