"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Method to be implemented that will be executed whenever the event this handler
 * is for is emitted by the Client
 * @abstact
 * @method Event#action
 * @param {any[]} ...args - The args your event handler will be receiving
 * 							from the event it handles. This can be any number
 * 							of arguments and obviously they can be received
 * 							individually or as a rest parameter without issue
 * @returns {void}
 */
/**
 * Event class to extend when writing your own custom event handlers
 * @abstract
 * @param {string} name - Name of the Client event this event handler
 * 						  will handle when emitted
 */
class Event {
    constructor(name) {
        /**
         * The name of the event this Event handler handles
         * @type {string}
         */
        this.name = name;
    }
    /**
     * Receive the client instance and save it
     * @private
     */
    _register(client) {
        /**
         * The YAMDBF Client instance
         * @type {Client}
         */
        this.client = client;
    }
}
exports.Event = Event;

//# sourceMappingURL=Event.js.map
