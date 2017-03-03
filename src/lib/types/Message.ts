import { Message as DMessage } from 'discord.js';
import { Guild } from './Guild';

export class Message extends DMessage
{
	public guild: Guild;
}
