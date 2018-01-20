import { Resolver } from './Resolver';
import { Client } from '../../client/Client';
import { ResolverConstructor } from '../../types/ResolverConstructor';

import { NumberResolver } from './base/NumberResolver';
import { StringResolver } from './base/StringResolver';
import { DurationResolver } from './base/DurationResolver';
import { UserResolver } from './base/UserResolver';
import { MemberResolver } from './base/MemberResolver';
import { BannedUserResolver } from './base/BannedUserResolver';
import { ChannelResolver } from './base/ChannelResolver';
import { RoleResolver } from './base/RoleResolver';

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
			DurationResolver,
			UserResolver,
			MemberResolver,
			BannedUserResolver,
			ChannelResolver,
			RoleResolver
		];
	}

	/**
	 * Load resolvers from _base and client._customResolvers
	 * @private
	 */
	public _loadResolvers(): void
	{
		for (const resolver of this._base.concat(this._client._customResolvers))
		{
			let newResolver = new resolver(this._client);
			this.loaded[newResolver.name] = newResolver;
		}
	}
}
