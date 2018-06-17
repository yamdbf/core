"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a localization string parsed and compiled from a .lang file,
 * capable of validating arguments it expects at runtime
 * @private
 */
class LangStringNode {
    constructor(lang, key, value, raw, scripts) {
        this.lang = lang;
        this.key = key;
        this.value = value;
        this.raw = raw;
        this.scripts = scripts;
        this.args = {};
        if (LangStringNode._argsDirective.test(raw)) {
            if (!LangStringNode._validArgsDirective.test(raw))
                throw new TypeError(`in string \`${lang}::${key}\`: Malformed args directive`);
            const directive = raw.match(LangStringNode._argsDirective)[1];
            const argList = directive.match(LangStringNode._argList)[1];
            const allArgs = argList.match(LangStringNode._allArgs);
            // Return whether or not the given type is an array type
            const isArrayType = type => /\w+\[\]/.test(type);
            // Return whether or not the given arg is optional
            const isOptionalArg = arg => /\w+\?/.test(arg);
            // Throw a type error if the given type is not valid
            const validateType = (type, val, arg, array) => {
                if (type === 'any')
                    return;
                if (typeof val === type)
                    return;
                throw new TypeError([
                    `String \`${lang}::${key}\`, ${array ? 'array ' : ''}arg \`${arg}\`:`,
                    `Expected type \`${type}\`, got ${typeof val}`
                ].join(' '));
            };
            // Process the lang string args directive and save the
            // argument type info for later use by the args validator
            for (const arg of allArgs) {
                const parsedArg = arg.match(LangStringNode._singleArg);
                const argKey = parsedArg[1];
                const argType = parsedArg[2];
                const rawKey = isOptionalArg(argKey) ? argKey.slice(0, -1) : argKey;
                const rawType = isArrayType(argType) ? argType.slice(0, -2) : argType;
                if (!LangStringNode._validArgTypes.includes(rawType))
                    throw new TypeError(`in string \`${lang}::${key}\`: Type \`${argType}\` is not a valid arg type`);
                this.args[rawKey] = { optional: isOptionalArg(argKey), type: argType };
            }
            // Create and assign the args validator for this node
            this.argsValidator = args => {
                for (const argKey in this.args) {
                    const arg = this.args[argKey];
                    const rawType = isArrayType(arg.type) ? arg.type.slice(0, -2) : arg.type;
                    if (arg.optional && typeof args[argKey] === 'undefined')
                        continue;
                    if (typeof args[argKey] === 'undefined')
                        throw new TypeError([
                            `String \`${lang}::${key}\`, arg \`${argKey}\`:`,
                            `Expected type \`${arg.type}\`, got undefined`
                        ].join(' '));
                    if (isArrayType(arg.type)) {
                        if (!Array.isArray(args[argKey]))
                            throw new TypeError(`String \`${lang}::${key}\`, arg \`${argKey}\`: Expected Array`);
                        for (const val of args[argKey])
                            validateType(rawType, val, argKey, true);
                    }
                    else
                        validateType(rawType, args[argKey], argKey, false);
                }
            };
        }
    }
}
LangStringNode._argsDirective = /^(##! *<[^>]+?>)/m;
LangStringNode._validArgsDirective = /^##! *(?!< *, *)<(?:(?: *, *)?\w+\?? *: *\w+(?:\[\])?)+>/m;
LangStringNode._argList = /<([^>]+?)>/;
LangStringNode._allArgs = /\w+\?? *: *\w+(?:\[\])?/g;
LangStringNode._singleArg = /(\w+\??) *: *(\w+(?:\[\])?)/;
LangStringNode._validArgTypes = ['string', 'number', 'boolean', 'any'];
exports.LangStringNode = LangStringNode;

//# sourceMappingURL=LangStringNode.js.map
