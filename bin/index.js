"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const path = require("path");
var Client_1 = require("./client/Client");
exports.Client = Client_1.Client;
var Plugin_1 = require("./client/Plugin");
exports.Plugin = Plugin_1.Plugin;
var PluginLoader_1 = require("./client/PluginLoader");
exports.PluginLoader = PluginLoader_1.PluginLoader;
var Command_1 = require("./command/Command");
exports.Command = Command_1.Command;
var CommandLock_1 = require("./command/CommandLock");
exports.CommandLock = CommandLock_1.CommandLock;
var CommandDispatcher_1 = require("./command/CommandDispatcher");
exports.CommandDispatcher = CommandDispatcher_1.CommandDispatcher;
var CommandLoader_1 = require("./command/CommandLoader");
exports.CommandLoader = CommandLoader_1.CommandLoader;
var CommandRegistry_1 = require("./command/CommandRegistry");
exports.CommandRegistry = CommandRegistry_1.CommandRegistry;
var CompactModeHelper_1 = require("./command/CompactModeHelper");
exports.CompactModeHelper = CompactModeHelper_1.CompactModeHelper;
var ClientStorage_1 = require("./storage/ClientStorage");
exports.ClientStorage = ClientStorage_1.ClientStorage;
var GuildStorage_1 = require("./storage/GuildStorage");
exports.GuildStorage = GuildStorage_1.GuildStorage;
var GuildSettings_1 = require("./storage/GuildSettings");
exports.GuildSettings = GuildSettings_1.GuildSettings;
var GuildStorageLoader_1 = require("./storage/GuildStorageLoader");
exports.GuildStorageLoader = GuildStorageLoader_1.GuildStorageLoader;
var SingleProviderStorage_1 = require("./storage/SingleProviderStorage");
exports.SingleProviderStorage = SingleProviderStorage_1.SingleProviderStorage;
var SharedProviderStorage_1 = require("./storage/SharedProviderStorage");
exports.SharedProviderStorage = SharedProviderStorage_1.SharedProviderStorage;
var KeyedStorage_1 = require("./storage/KeyedStorage");
exports.KeyedStorage = KeyedStorage_1.KeyedStorage;
var Middleware_1 = require("./command/middleware/Middleware");
exports.Middleware = Middleware_1.Middleware;
var Resolver_1 = require("./command/resolvers/Resolver");
exports.Resolver = Resolver_1.Resolver;
var ResolverLoader_1 = require("./command/resolvers/ResolverLoader");
exports.ResolverLoader = ResolverLoader_1.ResolverLoader;
var RateLimit_1 = require("./command/RateLimit");
exports.RateLimit = RateLimit_1.RateLimit;
var RateLimiter_1 = require("./command/RateLimiter");
exports.RateLimiter = RateLimiter_1.RateLimiter;
var RateLimitManager_1 = require("./command/RateLimitManager");
exports.RateLimitManager = RateLimitManager_1.RateLimitManager;
var StorageProvider_1 = require("./storage/StorageProvider");
exports.StorageProvider = StorageProvider_1.StorageProvider;
var Providers_1 = require("./storage/Providers");
exports.Providers = Providers_1.Providers;
var Database_1 = require("./storage/Database");
exports.Database = Database_1.Database;
const CommandDecorators = require("./command/CommandDecorators");
exports.CommandDecorators = CommandDecorators;
var Time_1 = require("./util/Time");
exports.Time = Time_1.Time;
var Util_1 = require("./util/Util");
exports.Util = Util_1.Util;
var Logger_1 = require("./util/logger/Logger");
exports.Logger = Logger_1.Logger;
var LoggerDecorator_1 = require("./util/logger/LoggerDecorator");
exports.logger = LoggerDecorator_1.logger;
var Loggable_1 = require("./util/logger/Loggable");
exports.Loggable = Loggable_1.Loggable;
var LogLevel_1 = require("./types/LogLevel");
exports.LogLevel = LogLevel_1.LogLevel;
var Lang_1 = require("./localization/Lang");
exports.Lang = Lang_1.Lang;
var BaseStrings_1 = require("./localization/BaseStrings");
exports.BaseStrings = BaseStrings_1.BaseStrings;
var DeprecatedMethodDecorator_1 = require("./util/DeprecatedMethodDecorator");
exports.deprecatedMethod = DeprecatedMethodDecorator_1.deprecatedMethod;
var DeprecatedClassDecorator_1 = require("./util/DeprecatedClassDecorator");
exports.deprecatedClass = DeprecatedClassDecorator_1.deprecatedClass;
var ListenerUtil_1 = require("./util/ListenerUtil");
exports.ListenerUtil = ListenerUtil_1.ListenerUtil;
var Guild_1 = require("./types/Guild");
exports.Guild = Guild_1.Guild;
var Message_1 = require("./types/Message");
exports.Message = Message_1.Message;
exports.version = require(path.join(__dirname, '..', 'package')).version;
const discord_js_1 = require("discord.js");
// Add a getter for GuildStorage to the base Guild class
discord_js_1.Structures.extend('Guild', Guild => {
    return class extends Guild {
        get storage() {
            return this.client.storage.guilds.get(this.id);
        }
    };
});
/** @external {Client} See: {@link https://discord.js.org/#/docs/main/stable/class/Client} */
/** @external {ClientOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/ClientOptions} */
/** @external {Collection} See: {@link https://discord.js.org/#/docs/main/stable/class/Collection} */
/** @external {Guild} See: {@link https://discord.js.org/#/docs/main/stable/class/Guild} */
/** @external {Message} See: {@link https://discord.js.org/#/docs/main/stable/class/Message} */
/** @external {MessageOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/MessageOptions} */
/** @external {PermissionResolvable} See: {@link https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable} */
/** @external {Role} See: {@link https://discord.js.org/#/docs/main/stable/class/Role} */
/** @external {User} See: {@link https://discord.js.org/#/docs/main/stable/class/User} */
/**
 * @typedef {Array<any>} Tuple Represents an array of fixed length where the the item in
 * the specified position is of the specified type.
 *
 * Example:
 * ```
 * ['foo', 10] === [string, number] === Tuple<string, number>
 * ```
 */

//# sourceMappingURL=index.js.map
