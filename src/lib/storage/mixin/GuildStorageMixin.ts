import { Guild } from 'discord.js';
import { GuildSettings } from '../GuildSettings';
import { GuildStorage } from '../../types/GuildStorage';
import { StorageProvider } from '../StorageProvider';
import { Bot } from '../../bot/Bot';

export async function createGuildStorageMixin(storage: StorageProvider, settings: StorageProvider, guild: Guild, client: Bot): Promise<GuildStorage>
{
	const newStorage: GuildSettings = new GuildSettings(storage, guild, client);
	(<GuildStorage> newStorage).settings = new GuildSettings(settings, guild, client);
	await newStorage.init();
	await (<GuildStorage> newStorage).settings.init();
	return <GuildStorage> newStorage;
}
