import { GuildStorage } from '../storage/GuildStorage';
import * as Discord from 'discord.js';

export class Guild extends Discord.Guild
{
	public storage?: GuildStorage;
}
