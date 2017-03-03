import { Guild as DGuild } from 'discord.js';
import { GuildStorage } from '../storage/GuildStorage';

export class Guild extends DGuild
{
	public storage?: GuildStorage;
}
