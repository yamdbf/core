import { GuildSettings } from '../storage/GuildSettings';

export type GuildStorage = GuildSettings & { settings: GuildSettings };
