import { KeyedStorage } from './KeyedStorage';
import { GuildStorage } from '../storage/GuildStorage';
import { Client } from '../client/Client';
import { Collection } from 'discord.js';
import { ClientStorage } from '../types/ClientStorage';

/**
 * Used for creating the different storage class mixins used throughout
 * and needed by YAMDBF Clients. Used internally, shouldn't ever
 * need to be used directly in a custom client
 * @private
 * @class StorageFactory
 * @param {Client} client The YAMDBF Client instance
 */
export class StorageFactory
{
	private readonly _client: Client;

	public constructor(client: Client)
	{
		this._client = client;
	}

	/**
	 * Creates a ClientStorage mixin using KeyedStorage as a base. Adds a `guilds` Collection
	 * that will map Guild IDs to GuildStorages
	 * @returns {ClientStorage}
	 */
	public createClientStorage(): ClientStorage
	{
		const storage: KeyedStorage = new KeyedStorage('client_storage', this._client.provider);
		(<ClientStorage> storage).guilds = new Collection<string, GuildStorage>();
		return <ClientStorage> storage;
	}
}
