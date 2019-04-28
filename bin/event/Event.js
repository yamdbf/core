"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Method to be implemented that will be executed whenever the event this handler
 * is for is emitted by the Client
 * @abstact
 * @method Event#action
 * @param {any[]} ...args - The args your event handler will be receiving
 * 						 from the event it handles
 * @returns {void}
 */
/**
 * Event class to extend when writing your own custom event handlers
 * @abstract
 * @param {string} name - Name of the Client event this event handler
 * 						  will handle
 */
class Event {
    constructor(name) {
        this.name = name;
    }
    /**
     * Receive the client instance and save it
     * @private
     */
    _register(client) {
        this.client = client;
    }
}
exports.Event = Event;

//# sourceMappingURL=Event.js.map
