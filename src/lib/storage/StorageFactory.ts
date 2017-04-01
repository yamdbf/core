import { KeyedStorage } from './KeyedStorage';
import { GuildStorage } from '../types/GuildStorage';
import { StorageProvider } from './StorageProvider';
import { Bot } from '../bot/Bot';
import { GuildSettings } from './GuildSettings';
import { Guild, Collection } from 'discord.js';
import { ClientStorage } from '../types/ClientStorage';

/**
 * Used for creating the different storage class mixins used throughout
 * and needed by YAMDBF Clients. Used internally, shouldn't ever
 * need to be used in your bots
 * @private
 * @class StorageFactory
 * @param {Client} client The YAMDBF Client instance
 * @param {StorageProvider} guildDataStorage StorageProvider instance that provides all guild data
 * @param {StorageProvider} guildSettingStorage StorageProvider instance that provides all guild settings
 */
export class StorageFactory
{
	private _client: Bot;
	private _guildDataStorage: StorageProvider;
	private _guildSettingStorage: StorageProvider;
	public constructor(client: Bot, guildDataStorage: StorageProvider, guildSettingStorage: StorageProvider)
	{
		this._client = client;
		this._guildDataStorage = guildDataStorage;
		this._guildSettingStorage = guildSettingStorage;
	}

	/**
	 * Creates a GuildStorage mixin, creating the GuildSettings instance under `.settings`
	 * @param {string} id ID of the Guild to create storage for
	 * @returns {Promise<GuildStorage>}
	 */
	public async createGuildStorage(id: string): Promise<GuildStorage>
	{
		const guild: Guild = this._client.guilds.get(id);
		const newStorage: GuildSettings = new GuildSettings(this._guildDataStorage, guild, this._client);
		(<GuildStorage> newStorage).settings = new GuildSettings(this._guildSettingStorage, guild, this._client);
		await newStorage.init();
		await (<GuildStorage> newStorage).settings.init(true);
		return <GuildStorage> newStorage;
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
