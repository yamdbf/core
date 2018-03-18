"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lang_1 = require("../../localization/Lang");
async function localizeLoader(message, args) {
    const lang = await Lang_1.Lang.getLangFromMessage(message);
    const res = Lang_1.Lang.createResourceLoader(lang);
    return [message, [res, ...args]];
}
exports.localizeLoader = localizeLoader;

//# sourceMappingURL=LocalizeLoader.js.map
