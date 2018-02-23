"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../../util/Util");
function resolve(argTypes) {
    if (typeof argTypes === 'string')
        argTypes =
            Util_1.Util.parseArgTypes(argTypes);
    const names = Object.keys(argTypes);
    const types = names
        .map(name => argTypes[name]);
    return async function (message, args) {
        let foundRestArg = false;
        for (let [index, arg] of args.entries()) {
            if (index > names.length - 1)
                break;
            const name = names[index];
            let type = types[index];
            if (name.includes('...')) {
                if (index !== names.length - 1)
                    throw new Error(`Rest arg \`${name}\` must be the final argument descriptor.`);
                arg = args.slice(index).join(' ');
                args[index] = arg;
                args = args.slice(0, index + 1);
                foundRestArg = true;
            }
            if (type instanceof Array)
                type = 'String';
            if (type === 'Any')
                continue;
            const resolver = this.client.resolvers.get(type);
            if (!resolver)
                throw new Error(`in arg \`${name}\`: Type \`${type}\` is not a valid argument type.`);
            const value = await resolver.resolve(message, this, name, arg);
            args[index] = value;
            if (foundRestArg)
                break;
        }
        return [message, args];
    };
}
exports.resolve = resolve;

//# sourceMappingURL=Resolve.js.map
