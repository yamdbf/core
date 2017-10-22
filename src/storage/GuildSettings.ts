import { SharedProviderStorage } from './SharedProviderStorage';
import { Guild } from 'discord.js';
import { StorageProvider } from './StorageProvider';
import { Client } from '../client/Client';
import { Logger } from '../util/logger/Logger';

/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with settings for a specific guild. Will be contained
 * under {@link GuildStorage#settings}
 */
export class GuildSettings extends SharedProviderStorage
{
	private readonly _client: any;

	public constructor(storage: StorageProvider, guild: Guild, client: Client)
	{
		super(storage, guild.id);
		this._client = client;
	}

	/**
	 * Initialize this storage instance
	 * @returns {Promise<void>}
	 */
	public async init(useDefaults: boolean = false): Promise<void>
	{
		try
		{
			await super.init();
			let data: any = JSON.parse(await this._provider.get(this._key));

			if (useDefaults)
			{
				const defaults: any = await this._client.storage.get('defaultGuildSettings');
				for (const key of Object.keys(defaults))
					if (typeof data[key] === 'undefined') data[key] = defaults[key];

				await this._provider.set(this._key, JSON.stringify(data));
			}

			this._cache = data;
		}
		catch (err)
		{
			Logger.instance().error('GuildStorage', err.stack);
		}
	}
}
