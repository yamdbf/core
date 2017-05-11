import 'reflect-metadata';
import { EventEmitter } from 'events';

/**
 * Contains static methods for declaring class methods (within a class extending `EventEmitter`)
 * as listeners for events that will be emitted by the class or parent classes
 * @module ListenerUtil
 */
export class ListenerUtil
{
	/**
	 * Attaches any listeners registered via the `on` or `once` decorators.
	 * Must be called ***after*** `super()`, and only in classes extending `EventEmitter`
	 * (which includes the Discord.js Client class and thus the YAMDBF Client class);
	 * @static
	 * @method registerListeners
	 * @param {EventEmitter} emitter EventEmitter to register listeners for
	 * @returns {void}
	 */
	public static registerListeners(emitter: EventEmitter): void
	{
		if (!(emitter instanceof EventEmitter))
			throw new TypeError('Listeners can only be registered on classes extending EventEmitter');
		if (typeof Reflect.getMetadata('listeners', emitter.constructor.prototype) === 'undefined') return;

		for (const listener of <ListenerMetadata[]> Reflect.getMetadata('listeners', emitter.constructor.prototype))
		{
			if (!(<any> emitter)[listener.method]) continue;
			if (listener.attached) continue;
			listener.attached = true;
			emitter[listener.once ? 'once' : 'on'](listener.event,
				(...eventArgs: any[]) => (<any> emitter)[listener.method](...eventArgs));
		}
	}

	/**
	 * Declares the decorated method as an event handler for the specified event
	 * Must be registered by calling {@link ListenerUtil.registerListeners()}
	 *
	 * > **Note:** `registerListeners()` is already called in the YAMDBF
	 * {@link Client} constructor and does not need to be called in classes
	 * extending it
	 * @static
	 * @method on
	 * @param {string} event The name of the event to handle
	 * @returns {MethodDecorator}
	 */
	public static on(event: string): MethodDecorator
	{
		return ListenerUtil._setListenerMetadata(event);
	}

	/**
	 * Declares the decorated method as a single-use event handler for the
	 * specified event. Must be registered by calling
	 * {@link ListenerUtil.registerListeners()}
	 *
	 * > **Note:** `registerListeners()` is already called in the YAMDBF
	 * {@link Client} constructor and does not need to be called in classes
	 * extending it
	 * @static
	 * @method once
	 * @param {string} event The name of the event to handle
	 * @returns {MethodDecorator}
	 */
	public static once(event: string): MethodDecorator
	{
		return ListenerUtil._setListenerMetadata(event, true);
	}

	/**
	 * Returns a MethodDecorator that handles setting the appropriate listener
	 * metadata for a class method
	 * @private
	 */
	private static _setListenerMetadata(event: string, once: boolean = false): MethodDecorator
	{
		return function<T extends EventEmitter>(target: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor
		{
			const listeners: ListenerMetadata[] = Reflect.getMetadata('listeners', target) || [];
			listeners.push({ event: event, method: key, once: once });
			Reflect.defineMetadata('listeners', listeners, target);
			return descriptor;
		};
	}
}

/**
 * Represents metadata used to build an event listener
 * and assign it to a class method at runtime
 */
type ListenerMetadata =
{
	event: string;
	method: string;
	once: boolean;
	attached?: boolean;
};
