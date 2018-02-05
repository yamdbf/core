import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';

/**
 * Resolver class to extend for creating Command argument resolvers.
 * Custom Resolvers must implement the `validate()` and `resolve()` methods
 * @param {Client} client YAMDBF Client instance
 * @param {string} name Resolver type name. This is the type name used
 * 						when specifying types in [resolve]{@link module:Middleware.resolve}
 * 						and [expect]{@link module:Middleware.expect}<br>
 * 						**Note:** This is not passed by the ResolverLoader, so
 * 						pass it to `super()` yourself when creating custom Resolvers
 * @param {...string} aliases Alternative names the Resolver can be identified by
 */
export class Resolver
{
	protected client: Client;

	public name: string;
	public aliases: string[];

	public constructor(client: Client, name: string, ...aliases: string[])
	{
		this.client = client;

		/**
		 * Name that servers as an identifier for the resolver
		 * @type {string}
		 */
		this.name = name;

		/**
		 * Additional identifier strings
		 * @type {string[]}
		 */
		this.aliases = aliases;
	}

	/**
	 * Method to implement that should return whether or not the
	 * given value matches the type the resolver is meant to resolve.
	 * >Can be async
	 * @param {any} value Value to validate
	 * @returns {Promise<boolean>}
	 */
	public async validate(value: any): Promise<boolean>
	{
		throw new Error('Resolvers must implement the `validate` method');
	}

	/**
	 * Method to implement that should accept a string and return
	 * a resolved value of the type the resolver is meant to resolve.
	 * >Can be async
	 * @param {Message} message Discord.js Message instance
	 * @param {Command} command Instance of the Command being called
	 * @param {string} name Argument name
	 * @param {string} value Argument value
	 * @returns {Promise<any>}
	 */
	public async resolve(message: Message, command: Command, name: string, value: string): Promise<any>
	{
		throw new Error('Resolvers must implement the `resolve` method');
	}
}
