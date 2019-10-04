"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/logger/Logger");
const SharedProviderStorage_1 = require("../storage/SharedProviderStorage");
/**
 * Loads plugins and holds loaded plugins in case accessing
 * loaded plugins at runtime is desired
 * @param {Client} client
 * @param {Array<PluginConstructor|string>} plugins
 */
class PluginLoader {
    constructor(client, plugins) {
        this._client = client;
        this._plugins = plugins;
        this._provider = new this._client.provider('plugin_storage');
        /**
         * Object mapping Plugin names to Plugin instances
         * @type {object}
         */
        this.loaded = {};
    }
    /**
     * Loads the plugins passed in the YAMDBF Client options.
     * Called internally by the YAMDBF Client at startup
     * @private
     */
    async _loadPlugins() {
        await this._provider.init();
        this._logger.debug('Plugin storage provider initialized.');
        for (const [index, plugin] of this._plugins.entries()) {
            let loadedPlugin;
            if (typeof plugin === 'string') {
                let error;
                if (!/^yamdbf-/.test(plugin)) {
                    try {
                        loadedPlugin = new (require(plugin))(this._client);
                    }
                    catch (err) {
                        error = `${err}, trying 'yamdbf-${plugin}'...`;
                    }
                    try {
                        loadedPlugin = (loadedPlugin !== null && loadedPlugin !== void 0 ? loadedPlugin : new (require(`yamdbf-${plugin}`))(this._client));
                    }
                    catch (err) {
                        error = error
                            ? `${error}\n${err}, trying '@yamdbf/${plugin}'...`
                            : `${err}, trying '@yamdbf/${plugin}'...`;
                    }
                    try {
                        loadedPlugin = (loadedPlugin !== null && loadedPlugin !== void 0 ? loadedPlugin : new (require(`@yamdbf/${plugin}`))(this._client));
                    }
                    catch (err) {
                        error = error ? `${error}\n${err}` : err;
                    }
                }
                else {
                    try {
                        loadedPlugin = new (require(plugin))(this._client);
                    }
                    catch (err) {
                        error = err;
                    }
                }
                if (!loadedPlugin) {
                    this._logger.warn(`Failed to load plugin '${plugin}':\n\n${error}\n`);
                    continue;
                }
            }
            else {
                try {
                    loadedPlugin = new plugin(this._client);
                }
                catch (err) {
                    this._logger.warn(`Failed to load plugin at plugins[${index}]:\n\n${err}\n`);
                    continue;
                }
            }
            if (typeof loadedPlugin.name === 'undefined' || loadedPlugin.name === '') {
                this._logger.warn(`Plugin at plugins[${index}] is invalid: Missing name`);
                continue;
            }
            if (typeof loadedPlugin.init === 'undefined') {
                this._logger.warn(`Plugin at plugins[${index}] is invalid: Missing init()`);
                continue;
            }
            if (typeof this.loaded[loadedPlugin.name] !== 'undefined') {
                this._logger.warn(`Skipping Plugin at plugins[${index}]: Duplicate name '${loadedPlugin.name}'`);
                continue;
            }
            let pluginStorage;
            try {
                pluginStorage = new SharedProviderStorage_1.SharedProviderStorage(this._provider, loadedPlugin.name);
            }
            catch (_a) {
                this._logger.warn(`Failed to create storage for Plugin '${loadedPlugin.name}'`);
            }
            try {
                await pluginStorage.init();
            }
            catch (_b) {
                this._logger.warn(`Failed to initialize storage for Plugin '${loadedPlugin.name}'`);
            }
            this._logger.info(`Plugin '${loadedPlugin.name}' loaded, initializing...`);
            try {
                await loadedPlugin.init(pluginStorage);
                this._logger.info(`Plugin '${loadedPlugin.name}' initialized.`);
            }
            catch (err) {
                this._logger.warn(`Plugin '${loadedPlugin.name}' errored during initialization:\n\n${err.stack}`, '\n\nPlease report this error to the plugin author.\n');
                this._logger.info(`Plugin '${loadedPlugin.name}' initialized with errors.`);
            }
            this.loaded[loadedPlugin.name] = loadedPlugin;
        }
    }
}
__decorate([
    Logger_1.logger('PluginLoader')
], PluginLoader.prototype, "_logger", void 0);
exports.PluginLoader = PluginLoader;

//# sourceMappingURL=PluginLoader.js.map
