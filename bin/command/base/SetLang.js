"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
const CommandDecorators_1 = require("../CommandDecorators");
const Lang_1 = require("../../localization/Lang");
const Middleware_1 = require("../middleware/Middleware");
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'setlang',
            aliases: ['lang'],
            desc: 'List languages or set bot language',
            usage: '<prefix>setlang [lang]',
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, lang]) {
        let langs = Lang_1.Lang.langNames;
        if (typeof lang === 'undefined') {
            const prefix = await this.client.getPrefix(message.guild) || '';
            let names = langs.map(l => Lang_1.Lang.getMetaValue(l, 'name') || l);
            let currentLang = await message.guild.storage.settings.get('lang') || 'en_us';
            currentLang = Lang_1.Lang.getMetaValue(currentLang, 'name') || currentLang;
            names = names
                .map((l, i) => `${i + 1}:  ${l}`)
                .map(l => l.replace(` ${currentLang}`, `*${currentLang}`));
            let output = res.CMD_SETLANG_LIST({ langList: names.join('\n'), prefix });
            return message.channel.send(output);
        }
        if (!((lang - 1) in langs))
            return message.channel.send(res.CMD_SETLANG_ERR_INVALID());
        const newLang = langs[lang - 1];
        await message.guild.storage.settings.set('lang', newLang);
        res = Lang_1.Lang.createResourceProxy(newLang);
        const langName = Lang_1.Lang.getMetaValue(newLang, 'name') || newLang;
        return message.channel.send(res.CMD_SETLANG_SUCCESS({ lang: langName }));
    }
}
__decorate([
    CommandDecorators_1.using(Middleware_1.Middleware.resolve('lang?: Number')),
    CommandDecorators_1.using(Middleware_1.Middleware.localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=SetLang.js.map
