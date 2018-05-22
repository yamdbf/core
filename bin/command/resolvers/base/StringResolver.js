"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
class StringResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'String', 'string');
    }
    validate(value) {
        return typeof value === 'string';
    }
    resolveRaw(value) {
        return value instanceof Array ? value.join('\n') : value.toString();
    }
    resolve(_message, _command, _name, value) {
        return this.resolveRaw(value);
    }
}
exports.StringResolver = StringResolver;

//# sourceMappingURL=StringResolver.js.map
