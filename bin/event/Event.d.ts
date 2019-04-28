import { Client } from '../client/Client';
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
export declare abstract class Event<T extends Client = Client> {
    name: string;
    client: T;
    constructor(name: string);
    /**
     * Receive the client instance and save it
     * @private
     */
    _register(client: T): void;
    abstract action(...args: any[]): void;
}
