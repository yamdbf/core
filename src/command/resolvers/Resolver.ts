import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';

/**
 * Resolver class to extend for creating Command argument resolvers.
 * Custom Resolvers must implement the `validate()` and `resolve()` methods
 * @param {Client} client YAMDBF Client instance
 * @param {string} name Resolver type name. This is the type name used
 * 						when specifying types in [resolve]{@link module:Middleware.resolve}
 * 						and [expect]{@link module:Middleware.expect}<br><br>
 * 						**Note:** This is not passed by the ResolverLoader, so
 * 						pass it to `super()` yourself when creating custom Resolvers
 */
export class Resolver
{
	protected client: Client;

	public name: string;

	public constructor(client: Client, name: string)
	{
		this.client = client;
		this.name = name;
	}

	/**
	 * Method to implement that returns whether or not the given value
	 * matches the type the resolver is meant to resolve
	 * @param {any} value Value to validate
	 */
	public async validate(value: any): Promise<boolean>
	{
		throw new Error('Resolvers must implement the `validate` method');
	}

	/**
	 * Method to implement that accepts a string and returns a resolved
	 * value of the type the resolver is meant to resolve
	 * @param {Message} message Discord.js Message instance
	 * @param {Command} command Instance of the Command being called
	 * @param {string} name Argument name
	 * @param {string} value Argument value
	 */
	public async resolve(message: Message, command: Command, name: string, value: string): Promise<any>
	{
		throw new Error('Resolvers must implement the `resolve` method');
	}
}
