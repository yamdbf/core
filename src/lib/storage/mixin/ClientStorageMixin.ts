import { Collection } from 'discord.js';
import { StorageProvider } from '../StorageProvider';
import { ClientStorage } from '../../types/ClientStorage';
import { GuildStorage } from '../../types/GuildStorage';

export function applyClientStorageMixin(storage: StorageProvider): void
{
	(<ClientStorage> storage).guilds = new Collection<string, GuildStorage>();
}
