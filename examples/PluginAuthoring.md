## Plugin Authoring Guide
Plugins allow developers to create modular functionality that can be used across
any number of YAMDBF bots with ease. There is no limit to what can be done via
plugins as they will have access to the instance of the Client that loads them
at runtime so they can do anything a raw Client is capable of.

Be sure to read the documentation for [Plugin](Plugin.html) and [IPlugin](IPlugin.html)
before getting started.

## Getting started
The first thing to go over is exporting your plugin. Really you can export it any
way you want or need to as long as you provide an adequate explanation for other
developers to be able to use your plugin, but for simple plugins that require
no extra runtime information from the developer (like an API key or something)
a top level export via `module.exports = class extends Plugin` will allow people
using your plugin to add it to their Client simply by passing the name of the
package to their Client plugin array.

If you do require extra data from the developer at runtime however then I recommend
exporting a function that accepts the extra data you need as arguments and returns
your Plugin class, capturing this extra data in the function closure.

For example, in my `command-usage` plugin I require a channel ID to be passed in
for logging command usage to a Discord channel. I accomplish this by exporting
the following function:
```js
function commandUsageFactory(channel)
{
	// `CommandUsage` being the name of my custom Plugin class
	return class extends CommandUsage
	{
		constructor(client)
		{
			super(client, channel);
		}
	};
}
```
This function returns a class that extends my custom Plugin class, forwarding the
`client` parameter to `super()` along with the `channel` parameter passed to the
function.

>Of course if you do this, as I said earlier, you should provide an adequate
explanation of how your plugin should be used.


A custom Plugin class must have the following two things to be considered valid:
- A `name` field
- An `init()` method

Example:
```js
class CustomPlugin extends Plugin
{
	name = 'CustomPlugin';

	constructor(client)
	{
		super();
		this.client = client;
	}

	init(storage)
	{
		this.storage = storage;
		console.log('Custom plugin initialized.');
	}
}
```
The `name` field is what is used for identifying the plugin if there are any errors
during plugin initialization and for accessing a plugin at runtime via the Client
instance:
```js
<Client>.plugins.loaded.CustomPlugin
```

The Plugin `init()` method will be called when the plugin is loaded, which is after
all storages (including guild storages) are available but before `clientReady` is
emitted. Assuming you store the client instance passed in the Plugin constructor
like in the example above, you will be able to use it here. This method can be async
if needed to make things easier for yourself. This method will also be passed a
`SharedProviderStorage` instance specific to your plugin when called by the PluginLoader
at runtime. This should be set aside for use like in the example if storage is needed
for your plugin.


## Plugin tools
There are a few methods in YAMDBF designed to make some things that would be
desirable for plugins to do easier (Or in the case of TypeScript, possible at all
by providing public workarounds to the more complex private methods). These methods
are few in number but important in your toolbox as a plugin developer:

- [`Lang.setMetaValue(lang, key, value)`](module-Lang.html#setMetaValue)
- [`Lang.loadLocalizationsFrom(dir)`](module-Lang.html#loadLocalizationsFrom)
- [`Lang.loadCommandLocalizationsFrom(dir)`](module-Lang.html#loadCommandLocalizationsFrom)
- [`<Client>.commands.registerExternal(command)`](CommandRegistry.html#registerExternal)

`Lang.setMetaValue()` can be used to set arbitrary metadata for custom localization
languages you may be providing via your plugin. Specifically this can be used to
set a proper display name for a localization language:
```js
Lang.setMetaValue('de_de', 'name', 'Deutsch');
```
The `name` value will be used in the `setlang` command when listing available languages.

Loading custom localizations can be done with the next two methods in the list.
`Lang.loadLocalizationsFrom(dir)` can be used to load `.lang` files from a directory
and `Lang.loadCommandLocalizationsFrom(dir)` can be used to load `.lang.json` files
from a directory.

Registering custom commands can be done individually by creating an instance of your
custom command class and passing it to the last method in the list:
```js
<Client>.commands.registerExternal(new CustomCommand());
```

This allows plugins to add any number of arbitrary commands for a Client to use.

That's about it for the basics. Anything more complex than what is explained here,
while possible, is entirely up to you as a developer. If you have any questions you
can ask them in the YAMDBF Discord server.