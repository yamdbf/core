## Starting a bot in YAMDBF 3.0.0
YAMDBF 3.0.0 comes with a handful of breaking changes, the first of which is fairly important and affects how you start up your bot.
When a YAMDBF Client instance is first created, commands will be synchronously loaded. After that is finished the `start()` method
may be executed. The first thing you should note is that `ready` is no longer the event you will want to subscribe to for
determining when the YAMDBF Client is ready for use. The new event is `clientReady`

After `start()` is called the Client will go through the Discord.js client login process and register some event
listeners for some internal things. During this time the Client `init()` method will be called. This is where storages --
`ClientStorage` and all `GuildStorage` instances -- will be created and linked with the current storage provider. After
this process completes the `waiting` event will be emitted.

>Because of how storages are loaded asynchronously after `start()` is called it is no longer possible to interact with
default settings until after storages have been loaded, meaning guilds will have their default settings applied before
you will have the chance to set them when guild setting storage is generated for the first time. This means it becomes
necessary to either completely remove guild settings and allow them to regenerate after changing default settings the
first time the Client is started, or to iterate over guild storages and apply any changes one time to bring them up to date
with the defaults. This of course only needs to be done if you are trying to set a default setting the first time your client
is run and fresh storages are generated. After that the default settings will be properly applied to new guilds and their
settings.

After the `waiting` event is fired is when you have the opportunity to set up anything that needs it before the Client
is ready to operate. When you have finished with whatever you need to do after `waiting` you must use `<Client>.emit('finished');`
to tell the Client you have finished setting up. After this `clientReady` will be emitted and the Client will be ready for use.

I'll end this with a barebones example of starting a bot with the new startup flow and a simple example of what
setting a default setting will look like:
```
const { Client } = require('yamdbf');
const config = require('./config.json');

const client = new Client({
	name: 'YAMDBFBot',
	commandsDir: './commands',
	token: config.token,
	config: config
}).start();

client.on('waiting', async () =>
{
	await client.setDefaultSetting('prefix', '.');
	client.emit('finished');
});
```