import { Client } from '../client/Client';
import { EventRegistry } from './EventRegistry';

/**
 * Registers event handlers with the YAMDBF Client and handles
 * the creation of dispatch functions for those events
 * @private
 */
export class EventDispatcher
{
	private _client: Client;
	private _registry: EventRegistry;
	private _listenedEvents: string[];
	private _listenedEventFns: { [event: string]: ((...args: any[]) => void)[] };

	public constructor(client: Client, registry: EventRegistry)
	{
		this._client = client;
		this._registry = registry;
		this._listenedEvents = [];
		this._listenedEventFns = {};
	}

	/**
	 * Clear all events that currently have registered listeners
	 */
	public clearListenedEvents(): void
	{
		this._listenedEvents = [];
		for (const event in this._listenedEventFns)
		{
			for (const fn of this._listenedEventFns[event])
				this._client.removeListener(event, fn);

			delete this._listenedEventFns[event];
		}
	}

	/**
	 * Begin listening to the given event, dispatching events to the handlers
	 * stored in the registry for the given event
	 */
	public listen(event: string): void
	{
		if (this._listenedEvents.includes(event)) return;
		if (typeof this._listenedEventFns[event] === 'undefined')
			this._listenedEventFns[event] = [];

		const eventFn: (...args: any[]) => void = (...args) => {
			for (const e of this._registry.events[event])
				e(...args);
		};

		this._listenedEvents.push(event);
		this._listenedEventFns[event].push(eventFn);

		this._client.on(event, eventFn);
	}
}
