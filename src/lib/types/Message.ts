import { Guild } from './Guild';
import * as Discord from 'discord.js';

export class Message extends Discord.Message
{
	public guild: Guild;
}
