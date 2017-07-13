import { Client } from './Client';
import { Plugin } from './Plugin';
import { Logger } from '../util/logger/Logger';
import { PluginConstructor } from '../types/PluginConstructor';

/**
 * Loads plugins and holds loaded plugins in case accessing
 * loaded plugins at runtime is desired
 * @param {Client} client
 * @param {Array<Plugin|string>} plugins
 */
export class PluginLoader
{
	private logger: Logger = Logger.instance();
	private _client: Client;
	private _plugins: (PluginConstructor | string)[];
	public loaded: { [name: string]: any };

	public constructor(client: Client, plugins: (PluginConstructor | string)[])
	{
		this._client = client;
		this._plugins = plugins;

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
		const tag: string = 'PluginLoader';
		for (const [index, plugin] of this._plugins.entries())
		{
			let loadedPlugin: Plugin;
			if (typeof plugin === 'string')
			{
				let error: string;
				if (!/^yamdbf-/.test(plugin))
				{
					try { loadedPlugin = new (require(plugin))(this._client); }
					catch (err) { error = `${err}, trying 'yamdbf-${plugin}'...`; }

					try { loadedPlugin = loadedPlugin || new (require(`yamdbf-${plugin}`))(this._client); }
					catch (err) { error = error ? `${error}\n${err}` : err; }
				}
				else
				{
					try { loadedPlugin = new (require(plugin))(this._client); }
					catch (err) { error = err; }
				}

				if (!loadedPlugin) {
					this.logger.warn(tag, `Failed to load plugin '${plugin}':\n\n${error}\n`);
					continue;
				}
			}
			else
			{
				try { loadedPlugin = new plugin(this._client); }
				catch (err)
				{
					this.logger.warn(tag, `Failed to load plugin at plugins[${index}]:\n\n${err}`);
					continue;
				}
			}

			if (typeof loadedPlugin.name === 'undefined' || loadedPlugin.name === '')
			{
				this.logger.warn(tag, `Plugin at plugins[${index}] is invalid: Missing name`);
				continue;
			}

			if (typeof loadedPlugin.init === 'undefined')
			{
				this.logger.warn(tag, `Plugin at plugins[${index}] is invalid: Missing init()`);
				continue;
			}

			if (typeof this.loaded[loadedPlugin.name] !== 'undefined')
			{
				this.logger.warn(tag, `Skipping Plugin at plugins[${index}]: Duplicate name '${loadedPlugin.name}'`);
				continue;
			}

			this.logger.info(tag, `Plugin '${loadedPlugin.name}' loaded, initializing...`);

			await loadedPlugin.init();
			this.logger.info(tag, `Plugin '${loadedPlugin.name}' initialized.`);
			this.loaded[loadedPlugin.name] = loadedPlugin;
		}
	}
}
