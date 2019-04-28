import { Event } from './Event';
import { Client } from '../client/Client';
/**
 * Class for registering Event handlers
 * @private
 */
export declare class EventRegistry {
    private readonly _dispatcher;
    events: {
        [event: string]: Function[];
    };
    constructor(client: Client);
    /**
     * Clear all registered events registered with the registry and dispatcher
     */
    clearRegisteredEvents(): void;
    /**
     * Register the given Event instance with the registry and dispatcher
     */
    register(event: Event): void;
}
