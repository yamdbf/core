import { Client } from '../client/Client';
/**
 * Handles loading and registering Event class event handlers from
 * registered source directories.
 */
export declare class EventLoader {
    private readonly _logger;
    private readonly _client;
    private readonly _sources;
    private readonly _registry;
    constructor(client: Client);
    /**
     * Registers a source directory to load Event class event handlers from.
     * Does nothing if the directory is already registered. Events will be loaded
     * by the Client after the `continue` event is emitted at runtime
     * @returns {void}
     */
    addSourceDir(dir: string): void;
    /**
     * Returns whether or not the EventLoader has any registered source directories
     * @returns {boolean}
     */
    hasSources(): boolean;
    /**
     * Loads or reloads all Events from all registered sources. Allows for hot-reloading
     * @returns {number} The total number of loaded or reloaded events
     */
    loadFromSources(): number;
    /**
     * Unregisters and clears all loaded Event class event handlers
     * @private
     */
    private _clearEvents;
    /**
     * Load events from the given directory
     * @private
     */
    private _loadEventsFrom;
    /**
     * Recursively search for Event classes within the given object
     * @private
     */
    private _findEventClasses;
}
