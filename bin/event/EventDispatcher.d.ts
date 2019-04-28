import { Client } from '../client/Client';
import { EventRegistry } from './EventRegistry';
/**
 * Registers event handlers with the YAMDBF Client and handles
 * the creation of dispatch functions for those events
 * @private
 */
export declare class EventDispatcher {
    private _client;
    private _registry;
    private _listenedEvents;
    private _listenedEventFns;
    constructor(client: Client, registry: EventRegistry);
    /**
     * Clear all events that currently have registered listeners
     */
    clearListenedEvents(): void;
    /**
     * Begin listening to the given event, dispatching events to the handlers
     * stored in the registry for the given event
     */
    listen(event: string): void;
}
