/**
 * Represents a Discord.js Message object that contains a modifed {@link Guild} object
 * containing a {@link GuildStorage} for the associated guild, if the message was sent
 * from within a guild, mixed in by the CommandDispatcher.<br><br>
 *
 * <b>Note:</b> For bots written in Typescript, you will want to import
 * <code>Message</code> from YAMDBF rather than Discord.js to be able to
 * access <code>message.guild.storage</code> within your commands without
 * compiler errors
 * @class Message
 * @mixin
 * @mixes external:Message
 * @property {guild} Guild Guild object that will contain the GuildStorage object
 * 						   under the <code>storage</code> property
 */

import { Guild } from './Guild';
import * as Discord from 'discord.js';

export class Message extends Discord.Message
{
	public guild: Guild;
}
