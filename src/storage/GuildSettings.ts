import { Client } from '../client/Client';
import { Guild } from 'discord.js';
import { Logger } from '../util/logger/Logger';
import { SharedProviderStorage } from './SharedProviderStorage';
import { StorageProvider } from './StorageProvider';

/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with settings for a specific guild. Will be contained
 * under {@link GuildStorage#settings}
 * @borrows SharedProviderStorage#keys as GuildSettings#keys
 * @borrows SharedProviderStorage#get as GuildSettings#get
 * @borrows SharedProviderStorage#set as GuildSettings#set
 * @borrows SharedProviderStorage#remove as GuildSettings#remove
 * @borrows SharedProviderStorage#clear as GuildSettings#clear
 */
export class GuildSettings extends SharedProviderStorage
{
	private readonly _client: any;

	public constructor(client: Client, guild: Guild, storage: StorageProvider)
	{
		super(storage, guild.id);
		this._client = client;
	}

	/**
	 * Initialize this storage instance
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		try
		{
			await super.init();
			const raw: string = (await this._provider.get(this._key))!;
			const data: any = JSON.parse(raw);

			const defaults: any = await this._client.storage.get('defaultGuildSettings');
			for (const key of Object.keys(defaults))
				if (typeof data[key] === 'undefined') data[key] = defaults[key];

			await this._provider.set(this._key, JSON.stringify(data));

			this._cache = data;
		}
		catch (err) { Logger.instance().error('GuildSettings', err.stack); }
	}
}
