"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lang_1 = require("../../localization/Lang");
const Util_1 = require("../../util/Util");
const BaseStrings_1 = require("../../localization/BaseStrings");
function expect(argTypes) {
    if (typeof argTypes === 'string')
        argTypes = Util_1.Util.parseArgTypes(argTypes);
    const names = Object.keys(argTypes);
    const types = names
        .map(name => argTypes[name]);
    return async function (message, args) {
        const dm = message.channel.type !== 'text';
        const lang = dm
            ? this.client.defaultLang
            : await message.guild.storage.settings.get('lang')
                || this.client.defaultLang;
        const res = Lang_1.Lang.createResourceProxy(lang);
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(this, lang).usage.replace(/<prefix>/g, prefix);
        for (const [index, name] of names.entries()) {
            const arg = args[index];
            const type = types[index];
            if (typeof arg === 'undefined' || arg === null)
                throw new Error(res.EXPECT_ERR_MISSING_VALUE({
                    type: type instanceof Array ? type.map(t => `\`${t}\``).join(', ') : `\`${type}\``,
                    name,
                    usage
                }));
            if (type === 'Any')
                continue;
            if (type instanceof Array) {
                if (!type.map(a => a.toLowerCase()).includes(arg.toLowerCase()))
                    throw new Error(res.EXPECT_ERR_INVALID_OPTION({
                        type: type.map(t => `\`${t}\``).join(', '),
                        name,
                        arg,
                        usage
                    }));
                continue;
            }
            const resolver = this.client.resolvers.get(type);
            if (!resolver)
                throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);
            if (!(await resolver.validate(arg)))
                throw new Error(Lang_1.Lang.res('en_us', BaseStrings_1.BaseStrings.EXPECT_ERR_EXPECTED_TYPE, { name, expected: type, type: arg === 'Infinity' ? arg : arg.constructor.name }));
        }
        return [message, args];
    };
}
exports.expect = expect;

//# sourceMappingURL=Expect.js.map
