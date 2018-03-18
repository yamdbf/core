"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lang_1 = require("../../localization/Lang");
async function localize(message, args) {
    const lang = await Lang_1.Lang.getLangFromMessage(message);
    const res = Lang_1.Lang.createResourceProxy(lang);
    return [message, [res, ...args]];
}
exports.localize = localize;

//# sourceMappingURL=Localize.js.map
