"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Registers event handlers with the YAMDBF Client and handles
 * the creation of dispatch functions for those events
 * @private
 */
class EventDispatcher {
    constructor(client, registry) {
        this._client = client;
        this._registry = registry;
        this._listenedEvents = [];
        this._listenedEventFns = {};
    }
    /**
     * Clear all events that currently have registered listeners
     */
    clearListenedEvents() {
        this._listenedEvents = [];
        for (const event in this._listenedEventFns) {
            for (const fn of this._listenedEventFns[event])
                this._client.removeListener(event, fn);
            delete this._listenedEventFns[event];
        }
    }
    /**
     * Begin listening to the given event, dispatching events to the handlers
     * stored in the registry for the given event
     */
    listen(event) {
        if (this._listenedEvents.includes(event))
            return;
        if (typeof this._listenedEventFns[event] === 'undefined')
            this._listenedEventFns[event] = [];
        const eventFn = (...args) => {
            for (const e of this._registry.events[event])
                e(...args);
        };
        this._listenedEvents.push(event);
        this._listenedEventFns[event].push(eventFn);
        this._client.on(event, eventFn);
    }
}
exports.EventDispatcher = EventDispatcher;

//# sourceMappingURL=EventDispatcher.js.map
