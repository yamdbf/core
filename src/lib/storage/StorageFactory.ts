import { KeyedStorage } from './KeyedStorage';
import { GuildStorage } from '../types/GuildStorage';
import { StorageProvider } from './StorageProvider';
import { Bot } from '../bot/Bot';
import { GuildSettings } from './GuildSettings';
import { Guild, Collection } from 'discord.js';
import { ClientStorage } from '../types/ClientStorage';

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

	public async createGuildStorage(id: string): Promise<GuildStorage>
	{
		const guild: Guild = this._client.guilds.get(id);
		const newStorage: GuildSettings = new GuildSettings(this._guildDataStorage, guild, this._client);
		(<GuildStorage> newStorage).settings = new GuildSettings(this._guildSettingStorage, guild, this._client);
		await newStorage.init();
		await (<GuildStorage> newStorage).settings.init(true);
		return <GuildStorage> newStorage;
	}

	public createClientStorage(): ClientStorage
	{
		const storage: KeyedStorage = new KeyedStorage('client_storage', this._client.provider);
		(<ClientStorage> storage).guilds = new Collection<string, GuildStorage>();
		return <ClientStorage> storage;
	}
}
