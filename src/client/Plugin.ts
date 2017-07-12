import { IPlugin } from './interface/IPlugin';
import { Client } from './Client';

/**
 * Abstract class for Client plugins to extend. Provides runtime errors
 * for missing method implementations, and is necessary at compile-time
 * when using TypeScript for the compiler to recognize a Plugin as valid.
 *
 * >**Note:** While abstract, this class does receive and store the Client
 * instance at runtime. You will need to receive this and pass it to `super()`
 * if you are adding additional constructor functionality to a custom Plugin
 *
 * A plugin should be a self-contained module that provides additional
 * functionality for a Client. A plugin could do something as simple as
 * logging all command output to a logging channel, registering a set
 * of custom commands for the client to use, or even providing new
 * localization language packs.
 *
 * A plugin should not attempt to register custom commands via any means
 * other than [&lt;Client&gt;.commands.registerExternal()]{@link CommandRegistry#registerExternal},
 * otherwise any custom commands could be unloaded if the `reload` command
 * is called
 *
 * <blockquote>**Note:** A plugin is expected to have two things at runtime:
 * a `name` property containing the name of the plugin, and an async `init()`
 * method that will be called by the framework after loading the plugin.<br>
 * See: {@link IPlugin#name} and {@link IPlugin#init}</blockquote>
 *
 * <blockquote>**Warning:** Given the nature of the Plugin system, this allows you to
 * use code from other people for your bot. Considering any plugin will
 * have access to your Client instance and thus your Bot token, you should
 * be absolutely certain that the plugin is not going to do anything
 * malicious before using it</blockquote>
 * @abstract
 * @implements IPlugin
 * @param {Client} client The YAMDBF Client instance. This will be passed by
 * the plugin loader when the plugin is loaded at runtime. This will automatically
 * be received and stored under `<Plugin>.client` unless you provide your own
 * constructor implementation, in which case it must be received and passed
 * to `super()`
 */
export class Plugin implements IPlugin
{
	protected client: Client;
	public name: string;

	public constructor(client: Client)
	{
		/**
		 * YAMDBF Client instance
		 * @type {Client}
		 */
		this.client = client;
	}

	public async init(): Promise<void>
	{
		throw new Error('Plugins must implement the `init` method');
	}
}
