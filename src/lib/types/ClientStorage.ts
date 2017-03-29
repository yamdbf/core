import { KeyedStorage } from '../storage/KeyedStorage';
import { Collection } from 'discord.js';
import { GuildStorage } from './GuildStorage';

export type ClientStorage = KeyedStorage & { guilds: Collection<string, GuildStorage>; };
