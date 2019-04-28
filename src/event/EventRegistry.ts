import { Event } from './Event';
import { Client } from '../client/Client';
import { EventDispatcher } from './EventDispatcher';

/**
 * Class for registering Event handlers
 * @private
 */
export class EventRegistry
{
	private readonly _dispatcher: EventDispatcher;

	public events!: { [event: string]: Function[] };

	public constructor(client: Client)
	{
		this._dispatcher = new EventDispatcher(client, this);
		this.clearRegisteredEvents();
	}

	/**
	 * Clear all registered events registered with the registry and dispatcher
	 */
	public clearRegisteredEvents(): void
	{
		this.events = {};
		this._dispatcher.clearListenedEvents();
	}

	/**
	 * Register the given Event instance with the registry and dispatcher
	 */
	public register(event: Event): void
	{
		const eventName: string = event.name;

		if (typeof this.events[eventName] === 'undefined')
			this.events[eventName] = [];

		this.events[eventName].push((...args: any[]) => event.action(...args));
		this._dispatcher.listen(eventName);
	}
}
