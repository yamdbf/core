"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
class StringResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'String', 'string');
    }
    async validate(value) {
        return typeof value === 'string';
    }
    async resolve(message, command, name, value) {
        return value instanceof Array ? value.join('\n') : value.toString();
    }
}
exports.StringResolver = StringResolver;

//# sourceMappingURL=StringResolver.js.map
