import { Collection } from 'discord.js';
import { StorageProvider } from '../storage/StorageProvider';
import { GuildStorage } from './GuildStorage';

export type ClientStorage = StorageProvider & { guilds: Collection<string, GuildStorage>; };
