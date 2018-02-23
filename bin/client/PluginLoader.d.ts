import { Client } from './Client';
import { PluginConstructor } from '../types/PluginConstructor';
/**
 * Loads plugins and holds loaded plugins in case accessing
 * loaded plugins at runtime is desired
 * @param {Client} client
 * @param {Array<PluginConstructor|string>} plugins
 */
export declare class PluginLoader {
    private readonly _logger;
    private readonly _client;
    private readonly _provider;
    private _plugins;
    loaded: {
        [name: string]: any;
    };
    constructor(client: Client, plugins: (PluginConstructor | string)[]);
    /**
     * Loads the plugins passed in the YAMDBF Client options.
     * Called internally by the YAMDBF Client at startup
     * @private
     */
    _loadPlugins(): Promise<void>;
}
