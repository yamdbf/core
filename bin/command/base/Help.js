"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandDecorators_1 = require("../CommandDecorators");
const Middleware_1 = require("../middleware/Middleware");
const Lang_1 = require("../../localization/Lang");
const Util_1 = require("../../util/Util");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'help',
            desc: 'Provides information on bot commands',
            usage: `<prefix>help [command]`,
            info: 'Will DM command help information to the user to keep clutter down in guild channels'
        });
    }
    async action(message, [res, commandName]) {
        const dm = message.channel.type !== 'text';
        const mentionName = `@${this.client.user.tag} `;
        const lang = dm ? this.client.defaultLang
            : await message.guild.storage.settings.get('lang');
        const cInfo = (cmd) => Lang_1.Lang.getCommandInfo(cmd, lang);
        let command;
        let output = '';
        let embed = new discord_js_1.MessageEmbed();
        if (!commandName) {
            const usableCommands = this.client.commands
                .filter(c => !(!this.client.isOwner(message.author) && c.ownerOnly))
                .filter(c => !c.hidden && !c.disabled);
            const widest = usableCommands
                .map(c => c.name.length)
                .reduce((a, b) => Math.max(a, b));
            let commandList = usableCommands.map(c => `${Util_1.Util.padRight(c.name, widest + 1)}${c.guildOnly ? '*' : ' '}: ${cInfo(c).desc}`)
                .sort();
            const shortcuts = !dm
                ? await message.guild.storage.settings.get('shortcuts') || {}
                : {};
            const data = {
                isGuild: !dm,
                commandList,
                shortcuts: Object.keys(shortcuts),
                usage: cInfo(this).usage,
                mentionUsage: cInfo(this).usage
                    .replace('<prefix>', mentionName)
            };
            output = res.CMD_HELP_COMMAND_LIST(data);
            if (output.length >= 1024) {
                let mappedCommands = usableCommands
                    .sort((a, b) => a.name < b.name ? -1 : 1)
                    .map(c => (c.guildOnly ? '*' : ' ') + Util_1.Util.padRight(c.name, widest + 2));
                data.commandList = mappedCommands;
                data.namesOnly = true;
                output = res.CMD_HELP_COMMAND_LIST(data);
            }
        }
        else {
            command = this.client.commands
                .filter(c => !c.disabled && !(!this.client.isOwner(message.author) && c.ownerOnly))
                .find(c => c.name === commandName || c.aliases.includes(commandName));
            if (!command)
                output = res.CMD_HELP_UNKNOWN_COMMAND();
            else {
                const info = cInfo(command);
                output = res.CMD_HELP_CODEBLOCK({
                    serverOnly: command.guildOnly ? res.CMD_HELP_SERVERONLY() : '',
                    ownerOnly: command.ownerOnly ? res.CMD_HELP_OWNERONLY() : '',
                    commandName: command.name,
                    desc: info.desc,
                    aliasText: command.aliases.length > 0
                        ? res.CMD_HELP_ALIASES({ aliases: command.aliases })
                        : '',
                    usage: info.usage,
                    info: info.info ? `\n${info.info}` : ''
                });
            }
        }
        output = dm ? output.replace(/<prefix>/g, '')
            : output.replace(/<prefix>/g, await this.client.getPrefix(message.guild) || '');
        embed.setColor(11854048).setDescription(output);
        try {
            if (!this.client.dmHelp)
                await this.respond(message, '', { embed });
            else
                await message.author.send({ embed });
            if (!dm && this.client.dmHelp) {
                if (command)
                    message.reply(res.CMD_HELP_REPLY_CMD());
                else
                    message.reply(res.CMD_HELP_REPLY_ALL());
            }
        }
        catch (_a) {
            if (!dm)
                message.reply(res.CMD_HELP_REPLY_FAIL());
        }
    }
}
__decorate([
    CommandDecorators_1.using(Middleware_1.Middleware.localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Help.js.map
