"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NumberResolver_1 = require("./base/NumberResolver");
const StringResolver_1 = require("./base/StringResolver");
const BooleanResolver_1 = require("./base/BooleanResolver");
const DurationResolver_1 = require("./base/DurationResolver");
const UserResolver_1 = require("./base/UserResolver");
const MemberResolver_1 = require("./base/MemberResolver");
const BannedUserResolver_1 = require("./base/BannedUserResolver");
const ChannelResolver_1 = require("./base/ChannelResolver");
const RoleResolver_1 = require("./base/RoleResolver");
const CommandGroupResolver_1 = require("./base/CommandGroupResolver");
const CommandResolver_1 = require("./base/CommandResolver");
/**
 * Loads and stores Command argument {@link Resolver}s
 */
class ResolverLoader {
    constructor(client) {
        /**
         * Object mapping Resolver type names to their instances
         * @type {object}
         */
        this.loaded = {};
        this._client = client;
        this._base = [
            NumberResolver_1.NumberResolver,
            StringResolver_1.StringResolver,
            BooleanResolver_1.BooleanResolver,
            DurationResolver_1.DurationResolver,
            UserResolver_1.UserResolver,
            MemberResolver_1.MemberResolver,
            BannedUserResolver_1.BannedUserResolver,
            ChannelResolver_1.ChannelResolver,
            RoleResolver_1.RoleResolver,
            CommandGroupResolver_1.CommandGroupResolver,
            CommandResolver_1.CommandResolver
        ];
    }
    /**
     * Get a loaded Resolver by name or alias
     * @param {string} name Identifier of the Resolver to get
     * @returns {Resolver}
     */
    get(name) {
        return Object.values(this.loaded).find(r => r.name === name || r.aliases.includes(name));
    }
    /**
     * Load resolvers from _base and client._customResolvers.
     * Used internally
     * @private
     */
    _loadResolvers() {
        for (const resolver of this._base.concat(this._client._customResolvers)) {
            const newResolver = new resolver(this._client);
            this.loaded[newResolver.name] = newResolver;
        }
    }
}
exports.ResolverLoader = ResolverLoader;

//# sourceMappingURL=ResolverLoader.js.map
