import { Collection, Guild } from 'discord.js';
import { Client } from '../client/Client';
import { StorageProvider } from './StorageProvider';
import { GuildStorage } from '../storage/GuildStorage';

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
	 */
	public async init(): Promise<void>
	{
		await this._storageProvider.init();
		await this._settingsProvider.init();
	}

	/**
	 * Load data for each guild from persistent storage and store it in a
	 * {@link GuildStorage} object
	 */
	public async loadStorages(): Promise<void>
	{
		for (const key of await this._storageProvider.keys())
		{
			const guild: Guild = this._client.guilds.get(key);
			if (!guild) continue;

			const storage: GuildStorage = new GuildStorage(this._client, guild, this._storageProvider, this._settingsProvider);
			await storage.init();

			this._client.storage.guilds.set(key, storage);
		}

		await this.initNewGuilds();
	}

	/**
	 * Create GuildStorage for all guilds that do not
	 * currently have one for the Client session
	 */
	public async initNewGuilds(): Promise<void>
	{
		const storageKeys: string[] = Array.from(
			new Set([...(await this._storageProvider.keys()), ...(await this._settingsProvider.keys())]));

		const storagelessGuilds: Collection<string, Guild> =
			this._client.guilds.filter(g => !storageKeys.includes(g.id));

		for (const guild of storagelessGuilds.values())
		{
			const storage: GuildStorage = new GuildStorage(this._client, guild, this._storageProvider, this._settingsProvider);
			await storage.init();
			this._client.storage.guilds.set(guild.id, storage);
		}
	}

	/**
	 * Remove storage entries for a guild that the bot
	 * has been removed from
	 */
	public async removeGuild(guild: Guild): Promise<void>
	{
		await this._storageProvider.remove(guild.id);
		await this._settingsProvider.remove(guild.id);
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot is no longer a part of
	 */
	public async cleanGuilds(): Promise<void>
	{
		const dataStorageKeys: string[] = await this._storageProvider.keys();
		const settingsStorageKeys: string[] = await this._settingsProvider.keys();
		const guildlessStorages: string[] = dataStorageKeys.filter(guild => !this._client.guilds.has(guild));
		const guildlessSettings: string[] = settingsStorageKeys.filter(guild => !this._client.guilds.has(guild));

		for (const settingsKey of guildlessSettings) await this._settingsProvider.remove(settingsKey);
		for (const storageKey of guildlessStorages)
		{
			this._client.storage.guilds.delete(storageKey);
			await this._storageProvider.remove(storageKey);
		}
	}
}
