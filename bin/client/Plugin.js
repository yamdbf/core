"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Abstract class for Client plugins to extend. Provides runtime errors
 * for missing method implementations, and is necessary at compile-time
 * when using TypeScript for the compiler to recognize a Plugin as valid.
 *
 * Plugins will always be passed the YAMDBF Client instance when loaded.
 * If you intend to do anything with it you must receive it in your
 * plugin constructor which means you will need a `super()` call since
 * you will be overriding the parent Plugin constructor
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
 * a `name` property containing the name of the plugin, and an `init()`
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
class Plugin {
}
exports.Plugin = Plugin;

//# sourceMappingURL=Plugin.js.map
