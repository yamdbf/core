import { Client } from '../client/Client';
import { StorageProvider } from './StorageProvider';
import { GuildStorage } from '../storage/GuildStorage';
import { Util } from '../util/Util';

/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @private
 */
export class GuildStorageLoader
{
	private readonly _client: Client;
	private readonly _storageProvider: StorageProvider;
	private readonly _settingsProvider: StorageProvider;

	public constructor(client: Client)
	{
		this._client = client;
		this._storageProvider = new this._client.provider('guild_storage');
		this._settingsProvider = new this._client.provider('guild_settings');
	}

	/**
	 * Initialize storage providers for guild storage and settings
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		await this._storageProvider.init();
		await this._settingsProvider.init();
	}

	/**
	 * Load data for each guild from persistent storage and store it in a
	 * {@link GuildStorage} object
	 * @returns {Promise<void>}
	 */
	public async loadStorages(): Promise<void>
	{
		for (const guild of this._client.guilds.values())
		{
			if (this._client.storage.guilds.has(guild.id)) continue;

			const storage: GuildStorage = new GuildStorage(
				this._client, guild, this._storageProvider, this._settingsProvider);

			await storage.init();

			// Handle guild returning, possibly in a new shard or a new session
			if (await storage.settings.exists('YAMDBFInternal.remove'))
				await storage.settings.remove('YAMDBFInternal.remove');

			this._client.storage.guilds.set(guild.id, storage);
		}
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot has no longer been a part of for more than 7 days
	 * @returns {Promise<void>}
	 */
	public async cleanGuilds(): Promise<void>
	{
		const settingsStorageKeys: string[] = await this._settingsProvider.keys();
		for (const guildID of settingsStorageKeys)
		{
			const data: string = (await this._settingsProvider.get(guildID))!;
			if (!data) continue;

			const parsed: any = JSON.parse(data);
			const removeTime: number = Util.getNestedValue(parsed, ['YAMDBFInternal', 'remove']);

			if (!removeTime) continue;
			if (removeTime < Date.now())
			{
				await this._settingsProvider.remove(guildID);
				await this._storageProvider.remove(guildID);

				if (this._client.storage.guilds.has(guildID))
					this._client.storage.guilds.delete(guildID);
			}
		}
	}
}
