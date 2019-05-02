"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const path = require("path");
const Event_1 = require("./Event");
const Util_1 = require("../util/Util");
const EventRegistry_1 = require("./EventRegistry");
const Logger_1 = require("../util/logger/Logger");
/**
 * Handles loading and registering Event class event handlers from
 * registered source directories.
 */
class EventLoader {
    constructor(client) {
        this._client = client;
        this._sources = [];
        this._registry = new EventRegistry_1.EventRegistry(client);
    }
    /**
     * Registers a source directory to load Event class event handlers from.
     * Does nothing if the directory is already registered. Events will be loaded
     * by the Client after the `continue` event is emitted at runtime
     * @returns {void}
     */
    addSourceDir(dir) {
        const resolvedDir = path.resolve(dir);
        if (this._sources.includes(resolvedDir))
            return;
        this._sources.push(resolvedDir);
    }
    /**
     * Returns whether or not the EventLoader has any registered source directories
     * @returns {boolean}
     */
    hasSources() {
        return this._sources.length > 0;
    }
    /**
     * Loads or reloads all Events from all registered sources. Allows for hot-reloading
     * @returns {number} The total number of loaded or reloaded events
     */
    loadFromSources() {
        this._clearEvents();
        let loadedEvents = 0;
        for (const source of this._sources)
            loadedEvents += this._loadEventsFrom(source);
        return loadedEvents;
    }
    /**
     * Unregisters and clears all loaded Event class event handlers
     * @private
     */
    _clearEvents() {
        this._registry.clearRegisteredEvents();
    }
    /**
     * Load events from the given directory
     * @private
     */
    _loadEventsFrom(dir) {
        // Glob all the javascript files in the directory
        let eventFiles = glob.sync(`${dir}/**/*.js`);
        // Glob typescript files if `tsNode` is enabled
        if (this._client.tsNode) {
            eventFiles.push(...glob.sync(`${dir}/**/!(*.d).ts`));
            const filteredEventFiles = eventFiles.filter(f => {
                const file = f.match(/\/([^\/]+?)\.[j|t]s$/)[1];
                if (f.endsWith('.ts'))
                    return true;
                if (f.endsWith('.js'))
                    return !eventFiles.find(cf => cf.endsWith(`${file}.ts`));
            });
            eventFiles = filteredEventFiles;
        }
        const loadedEvents = [];
        this._logger.debug(`Loading events in: ${dir}`);
        // Load and instantiate every event from the globbed files
        for (const file of eventFiles) {
            // Delete the cached event file for hot-reloading
            delete require.cache[require.resolve(file)];
            const loadedFile = require(file);
            const eventClasses = this._findEventClasses(loadedFile);
            if (eventClasses.length === 0) {
                this._logger.warn(`Failed to find Event class in file: ${file}`);
                continue;
            }
            for (const eventClass of eventClasses) {
                const eventInstance = new eventClass();
                this._logger.info(`Loaded Event handler for event: ${eventInstance.name}`);
                loadedEvents.push(eventInstance);
            }
        }
        // Register all of the loaded events
        for (const event of loadedEvents) {
            event._register(this._client);
            this._registry.register(event);
        }
        return loadedEvents.length;
    }
    /**
     * Recursively search for Event classes within the given object
     * @private
     */
    _findEventClasses(obj) {
        const foundClasses = [];
        const keys = Object.keys(obj);
        if (Event_1.Event.prototype.isPrototypeOf(obj.prototype))
            foundClasses.push(obj);
        else if (keys.length > 0)
            for (const key of keys)
                if (Event_1.Event.prototype.isPrototypeOf(obj[key].prototype))
                    foundClasses.push(this._findEventClasses(obj[key]));
        return Util_1.Util.flattenArray(foundClasses);
    }
}
__decorate([
    Logger_1.logger('EventLoader')
], EventLoader.prototype, "_logger", void 0);
exports.EventLoader = EventLoader;

//# sourceMappingURL=EventLoader.js.map
