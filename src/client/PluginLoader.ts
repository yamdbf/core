import { Client } from './Client';
import { Plugin } from './Plugin';
import { Logger, logger } from '../util/logger/Logger';
import { StorageProvider } from '../storage/StorageProvider';
import { SharedProviderStorage } from '../storage/SharedProviderStorage';
import { PluginConstructor } from '../types/PluginConstructor';

/**
 * Loads plugins and holds loaded plugins in case accessing
 * loaded plugins at runtime is desired
 * @param {Client} client
 * @param {Array<PluginConstructor|string>} plugins
 */
export class PluginLoader
{
	@logger('PluginLoader')
	private readonly _logger!: Logger;
	private readonly _client: Client;
	private readonly _provider: StorageProvider;
	private _plugins: (PluginConstructor | string)[];

	public loaded: { [name: string]: any };

	public constructor(client: Client, plugins: (PluginConstructor | string)[])
	{
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
	public async _loadPlugins(): Promise<void>
	{
		await this._provider.init();
		this._logger.debug('Plugin storage provider initialized.');

		for (const [index, plugin] of this._plugins.entries())
		{
			let loadedPlugin!: Plugin;
			if (typeof plugin === 'string')
			{
				let error!: string;
				if (!/^yamdbf-/.test(plugin))
				{
					try { loadedPlugin = new (require(plugin))(this._client); }
					catch (err) { error = `${err}, trying 'yamdbf-${plugin}'...`; }

					try { loadedPlugin = loadedPlugin || new (require(`yamdbf-${plugin}`))(this._client); }
					catch (err)
					{
						error = error
							? `${error}\n${err}, trying '@yamdbf/${plugin}'...`
							: `${err}, trying '@yamdbf/${plugin}'...`;
					}

					try { loadedPlugin = loadedPlugin || new (require(`@yamdbf/${plugin}`))(this._client); }
					catch (err) { error = error ? `${error}\n${err}` : err; }
				}
				else
				{
					try { loadedPlugin = new (require(plugin))(this._client); }
					catch (err) { error = err; }
				}

				if (!loadedPlugin) {
					this._logger.warn(`Failed to load plugin '${plugin}':\n\n${error}\n`);
					continue;
				}
			}
			else
			{
				try { loadedPlugin = new plugin(this._client); }
				catch (err)
				{
					this._logger.warn(`Failed to load plugin at plugins[${index}]:\n\n${err}\n`);
					continue;
				}
			}

			if (typeof loadedPlugin.name === 'undefined' || loadedPlugin.name === '')
			{
				this._logger.warn(`Plugin at plugins[${index}] is invalid: Missing name`);
				continue;
			}

			if (typeof loadedPlugin.init === 'undefined')
			{
				this._logger.warn(`Plugin at plugins[${index}] is invalid: Missing init()`);
				continue;
			}

			if (typeof this.loaded[loadedPlugin.name] !== 'undefined')
			{
				this._logger.warn(`Skipping Plugin at plugins[${index}]: Duplicate name '${loadedPlugin.name}'`);
				continue;
			}

			let pluginStorage!: SharedProviderStorage;
			try { pluginStorage = new SharedProviderStorage(this._provider, loadedPlugin.name); }
			catch { this._logger.warn(`Failed to create storage for Plugin '${loadedPlugin.name}'`); }

			try { await pluginStorage.init(); }
			catch { this._logger.warn(`Failed to initialize storage for Plugin '${loadedPlugin.name}'`); }

			this._logger.info(`Plugin '${loadedPlugin.name}' loaded, initializing...`);
			try
			{
				await loadedPlugin.init(pluginStorage);
				this._logger.info(`Plugin '${loadedPlugin.name}' initialized.`);
			}
			catch (err)
			{
				this._logger.warn(`Plugin '${loadedPlugin.name}' errored during initialization:\n\n${err.stack}`,
					'\n\nPlease report this error to the plugin author.\n');
				this._logger.info(`Plugin '${loadedPlugin.name}' initialized with errors.`);
			}
			this.loaded[loadedPlugin.name] = loadedPlugin;
		}
	}
}
