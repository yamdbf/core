"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lang_1 = require("../../localization/Lang");
async function localize(message, args) {
    const dm = message.channel.type !== 'text';
    const lang = dm
        ? this.client.defaultLang
        : await message.guild.storage.settings.get('lang')
            || this.client.defaultLang;
    const res = Lang_1.Lang.createResourceLoader(lang);
    return [message, [res, ...args]];
}
exports.localize = localize;

//# sourceMappingURL=Localize.js.map
