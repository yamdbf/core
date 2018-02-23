"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
class Guild extends Discord.Guild {
}
exports.Guild = Guild;

//# sourceMappingURL=Guild.js.map
