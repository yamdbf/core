import { Collection, Guild } from 'discord.js';
import { Client } from '../client/Client';
import { StorageProvider } from './StorageProvider';
import { StorageFactory } from './StorageFactory';
import { GuildStorage } from '../types/GuildStorage';

/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @private
 */
export class GuildStorageLoader<T extends Client>
{
	private readonly _client: T;
	private readonly _storageFactory: StorageFactory;
	public constructor(client: T, storageFactory: StorageFactory)
	{
		this._client = client;
		this._storageFactory = storageFactory;
	}

	/**
	 * Load data for each guild from persistent storage and store it in a
	 * {@link GuildStorage} object
	 */
	public async loadStorages(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		for (const key of await dataStorage.keys())
		{
			const guildStorage: GuildStorage = await this._storageFactory.createGuildStorage(key);
			if (!guildStorage) continue;
			this._client.storage.guilds.set(key, guildStorage);
		}

		await this.initNewGuilds(dataStorage, settingsStorage);
	}

	/**
	 * Assign a GuildStorage to guilds that lack one due to the bot being
	 * in the guild before adopting this storage spec or the bot being
	 * added to a new guild
	 */
	public async initNewGuilds(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		const dataStorageKeys: string[] = await dataStorage.keys();
		let storagelessGuilds: Collection<string, Guild> = this._client.guilds.filter(g => !dataStorageKeys.includes(g.id));
		for (const guild of storagelessGuilds.values())
			this._client.storage.guilds.set(guild.id,
				await this._storageFactory.createGuildStorage(guild.id));
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot is no longer a part of
	 */
	public async cleanGuilds(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		const dataStorageKeys: string[] = await dataStorage.keys();
		const settingsStorageKeys: string[] = await settingsStorage.keys();
		let guildlessStorages: string[] = dataStorageKeys.filter(guild => !this._client.guilds.has(guild));
		let guildlessSettings: string[] = settingsStorageKeys.filter(guild => !this._client.guilds.has(guild));
		for (const settings of guildlessSettings) await settingsStorage.remove(settings);
		for (const storage of guildlessStorages)
		{
			this._client.storage.guilds.delete(storage);
			await dataStorage.remove(storage);
		}
	}
}
