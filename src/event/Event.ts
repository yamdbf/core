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
export abstract class Event<T extends Client = Client>
{
	public name: string;
	public client!: T;

	public constructor(name: string)
	{
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
	public register(client: T): void
	{
		/**
		 * The YAMDBF Client instance
		 * @type {Client}
		 */
		this.client = client;
	}

	// Docs above class
	public abstract action(...args: any[]): void;
}
