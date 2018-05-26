import { Resolver } from './Resolver';
import { Client } from '../../client/Client';
import { ResolverConstructor } from '../../types/ResolverConstructor';

import { NumberResolver } from './base/NumberResolver';
import { StringResolver } from './base/StringResolver';
import { BooleanResolver } from './base/BooleanResolver';
import { DurationResolver } from './base/DurationResolver';
import { UserResolver } from './base/UserResolver';
import { MemberResolver } from './base/MemberResolver';
import { BannedUserResolver } from './base/BannedUserResolver';
import { ChannelResolver } from './base/ChannelResolver';
import { RoleResolver } from './base/RoleResolver';
import { CommandGroupResolver } from './base/CommandGroupResolver';
import { CommandResolver } from './base/CommandResolver';

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
			const newResolver: Resolver = new resolver(this._client);
			this.loaded[newResolver.name] = newResolver;
		}
	}
}
