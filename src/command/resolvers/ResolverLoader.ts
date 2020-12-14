import { BannedUserResolver } from './base/BannedUserResolver';
import { BooleanResolver } from './base/BooleanResolver';
import { ChannelResolver } from './base/ChannelResolver';
import { Client } from '../../client/Client';
import { CommandGroupResolver } from './base/CommandGroupResolver';
import { CommandResolver } from './base/CommandResolver';
import { DurationResolver } from './base/DurationResolver';
import { MemberResolver } from './base/MemberResolver';
import { NumberResolver } from './base/NumberResolver';
import { Resolver } from './Resolver';
import { ResolverConstructor } from '../../types/ResolverConstructor';
import { RoleResolver } from './base/RoleResolver';
import { StringResolver } from './base/StringResolver';
import { UserResolver } from './base/UserResolver';

/**
 * Loads and stores Command argument {@link Resolver}s
 */
export class ResolverLoader
{
	private readonly _client: Client;
	private readonly _base: ResolverConstructor[];

	public loaded: { [name: string]: Resolver };

	public constructor(client: Client)
	{
		/**
		 * Object mapping Resolver type names to their instances
		 * @type {object}
		 */
		this.loaded = {};

		this._client = client;
		this._base = [
			NumberResolver,
			StringResolver,
			BooleanResolver,
			DurationResolver,
			UserResolver,
			MemberResolver,
			BannedUserResolver,
			ChannelResolver,
			RoleResolver,
			CommandGroupResolver,
			CommandResolver
		];
	}

	/**
	 * Get a loaded Resolver by name or alias
	 * @param {string} name Identifier of the Resolver to get
	 * @returns {Resolver}
	 */
	public get(name: string): Resolver
	{
		return Object.values(this.loaded).find(r => r.name === name || r.aliases.includes(name))!;
	}

	/**
	 * Load resolvers from _base and client._customResolvers.
	 * Used internally
	 * @private
	 */
	public _loadResolvers(): void
	{
		for (const resolver of this._base.concat(this._client._customResolvers))
		{
			// eslint-disable-next-line new-cap
			const newResolver: Resolver = new resolver(this._client);
			this.loaded[newResolver.name] = newResolver;
		}
	}
}
