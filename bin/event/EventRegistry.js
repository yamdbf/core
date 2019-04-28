"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventDispatcher_1 = require("./EventDispatcher");
/**
 * Class for registering Event handlers
 * @private
 */
class EventRegistry {
    constructor(client) {
        this._dispatcher = new EventDispatcher_1.EventDispatcher(client, this);
        this.clearRegisteredEvents();
    }
    /**
     * Clear all registered events registered with the registry and dispatcher
     */
    clearRegisteredEvents() {
        this.events = {};
        this._dispatcher.clearListenedEvents();
    }
    /**
     * Register the given Event instance with the registry and dispatcher
     */
    register(event) {
        const eventName = event.name;
        if (typeof this.events[eventName] === 'undefined')
            this.events[eventName] = [];
        this.events[eventName].push((...args) => event.action(...args));
        this._dispatcher.listen(eventName);
    }
}
exports.EventRegistry = EventRegistry;

//# sourceMappingURL=EventRegistry.js.map
