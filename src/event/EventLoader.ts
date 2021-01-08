import * as glob from 'glob';
import * as path from 'path';
import { logger, Logger } from '../util/logger/Logger';
import { Client } from '../client/Client';
import { Event } from './Event';
import { EventRegistry } from './EventRegistry';
import { Util } from '../util/Util';

/**
 * Handles loading and registering Event class event handlers from
 * registered source directories.
 */
export class EventLoader
{
	@logger('EventLoader')
	private readonly _logger!: Logger;

	private readonly _client: Client;
	private readonly _sources: string[];
	private readonly _registry: EventRegistry;

	public constructor(client: Client)
	{
		this._client = client;
		this._sources = [];
		this._registry = new EventRegistry(client);
	}

	/**
	 * Registers a source directory to load Event class event handlers from.
	 * Does nothing if the directory is already registered. Events will be loaded
	 * by the Client after the `continue` event is emitted at runtime
	 * @returns {void}
	 */
	public addSourceDir(dir: string): void
	{
		const resolvedDir: string = path.resolve(dir);
		if (this._sources.includes(resolvedDir)) return;
		this._sources.push(resolvedDir);
	}

	/**
	 * Returns whether or not the EventLoader has any registered source directories
	 * @returns {boolean}
	 */
	public hasSources(): boolean
	{
		return this._sources.length > 0;
	}

	/**
	 * Loads or reloads all Events from all registered sources. Allows for hot-reloading
	 * @returns {number} The total number of loaded or reloaded events
	 */
	public loadFromSources(): number
	{
		this._clearEvents();

		let loadedEvents: number = 0;
		for (const source of this._sources)
			loadedEvents += this._loadEventsFrom(source);

		return loadedEvents;
	}

	/**
	 * Unregisters and clears all loaded Event class event handlers
	 * @private
	 */
	private _clearEvents(): void
	{
		this._registry.clearRegisteredEvents();
	}

	/**
	 * Load events from the given directory
	 * @private
	 */
	private _loadEventsFrom(dir: string): number
	{
		// Glob all the javascript files in the directory
		let eventFiles: string[] = glob.sync(`${dir}/**/*.js`);

		// Glob typescript files if `tsNode` is enabled
		if (this._client.tsNode)
		{
			eventFiles.push(...glob.sync(`${dir}/**/!(*.d).ts`));
			const filteredEventFiles: string[] = eventFiles.filter(f =>
			{
				const file: string = f.match(/\/([^/]+?)\.[j|t]s$/)![1];
				if (f.endsWith('.ts')) return true;
				if (f.endsWith('.js'))
					return !eventFiles.some(cf => cf.endsWith(`${file}.ts`));

				return false;
			});
			eventFiles = filteredEventFiles;
		}

		const loadedEvents: Event[] = [];
		this._logger.debug(`Loading events in: ${dir}`);

		// Load and instantiate every event from the globbed files
		for (const file of eventFiles)
		{
			// Delete the cached event file for hot-reloading
			delete require.cache[require.resolve(file)];

			const loadedFile: any = require(file);
			const eventClasses: (new () => Event)[] = this._findEventClasses(loadedFile);

			if (eventClasses.length === 0)
			{
				this._logger.warn(`Failed to find Event class in file: ${file}`);
				continue;
			}

			// eslint-disable-next-line @typescript-eslint/naming-convention
			for (const EventClass of eventClasses)
			{
				const eventInstance: Event = new EventClass();

				this._logger.info(`Loaded Event handler for event: ${eventInstance.name}`);
				loadedEvents.push(eventInstance);
			}
		}

		// Register all of the loaded events
		for (const event of loadedEvents)
		{
			event.register(this._client);
			this._registry.register(event);
		}

		return loadedEvents.length;
	}

	/**
	 * Recursively search for Event classes within the given object
	 * @private
	 */
	private _findEventClasses(obj: any): (new () => Event)[]
	{
		const foundClasses: ((new () => Event) | (new () => Event)[])[] = [];
		const keys: string[] = Object.keys(obj);
		if (Event.prototype.isPrototypeOf(obj.prototype))
			foundClasses.push(obj);

		else if (keys.length > 0)
			for (const key of keys)
				if (Event.prototype.isPrototypeOf(obj[key].prototype))
					foundClasses.push(this._findEventClasses(obj[key]));

		return Util.flattenArray(foundClasses);
	}
}
