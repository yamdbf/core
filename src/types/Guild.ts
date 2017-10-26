/**
 * Represents a Discord.js Guild object that has had a {@link GuildStorage} object
 * for the guild the message was sent from, if any, mixed in by the CommandDispatcher before being passed
 * to the command action upon Command execution
 * @class Guild
 * @mixin
 * @mixes external:Guild
 * @property {?GuildStorage} storage GuildStorage object for the guild this message came from. Not present
 * 									 if the message was not sent from within a guild
 */

import { GuildStorage } from '../storage/GuildStorage';
import * as Discord from 'discord.js';

export class Guild extends Discord.Guild
{
	public storage?: GuildStorage;
}
