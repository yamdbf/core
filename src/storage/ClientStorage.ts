import { KeyedStorage } from './KeyedStorage';
import { GuildStorage } from './GuildStorage';
import { Client } from '../client/Client';
import { Collection } from 'discord.js';

/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with data specific to the Client instance, and for
 * accessing guild storages/settings
 * @mixes KeyedStorage
 * @borrows KeyedStorage#init as ClientStorage#init
 * @borrows KeyedStorage#keys as ClientStorage#keys
 * @borrows KeyedStorage#get as ClientStorage#get
 * @borrows KeyedStorage#set as ClientStorage#set
 * @borrows KeyedStorage#remove as ClientStorage#remove
 * @borrows KeyedStorage#clear as ClientStorage#clear
 */
export class ClientStorage extends KeyedStorage
{
	public readonly guilds: Collection<string, GuildStorage>;

	public constructor(client: Client)
	{
		super('client_storage', client.provider);

		/**
		 * Collection mapping Guild IDs to GuildStorages
		 * @name ClientStorage#guilds
		 * @type {external:Collection<string, GuildStorage>}
		 */
		this.guilds = new Collection<string, GuildStorage>();
	}
}
