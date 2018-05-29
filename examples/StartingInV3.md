## Starting a bot in YAMDBF 3.0.0
YAMDBF 3.0.0 comes with a handful of breaking changes, the first of which is fairly important and affects how you start up your bot.
When a YAMDBF Client instance is first created, commands will be synchronously loaded. After that is finished the `start()` method
may be executed. The first thing you should note is that `ready` is no longer the event you will want to subscribe to for
determining when the YAMDBF Client is ready for use. The new event is `clientReady`

After `start()` is called the Client will go through the Discord.js client login process and register some event
listeners for some internal things. During this time the Client `init()` method will be called. This is when `ClientStorage`
will be loaded and initialized. Now things can get a little tricky. If you don't pass `pause: true` in your YAMDBF
Client options then everything will be as it was previously in YAMDBF 2.6.2 and prior and startup will continue as normal,
emitting `clientReady` when everything is finished.

The thing to note here is that this does not allow you to add or change any default guild settings before guild storage
and settings are generated for the first time. That's where the `pause` option comes in. Passing `pause: true` in your YAMDBF
Client options will cause your Client to emit the `pause` event after it finishes initializing Client storage. This is when
you will have the opportunity to add or change default settings before guild settings and storage are generated/loaded.
After you've finished doing everything you need to do, use `<Client>.emit('continue')` to continue the Client startup process.

The next important change is that YAMDBF Client options no longer has a `config` field. This was only used to access the owner
field and really wasn't needed. `owner` is now a direct optional field in the Client options that accepts a user ID or array
of user IDs. Despite the config field no longer existing, it's still recommended to store sensitive information like your
token and owner ID/s in a config file that is not checked in to version control.

To sum things up, basic startup remains relatively unchanged. You'll notice the owner field in the example:
```
const { Client } = require('@yamdbf/core');
const config = require('./config.json');

const client = new Client({
	name: 'YAMDBFBot',
	commandsDir: './commands',
	token: config.token,
	owner: config.owner
}).start();
```

And advanced startup where addition or manipulation of default guild settings is desired will look like this:
```
const { Client } = require('@yamdbf/core');
const config = require('./config.json');

const client = new Client({
	name: 'YAMDBFBot',
	commandsDir: './commands',
	token: config.token,
	owner: config.owner,
	pause: true
}).start();

client.on('pause', () => {
	client.setDefaultSetting('prefix', '?')
		.then(() => client.emit('continue'));
});
```
>I've used a traditional promise in this example, but everything works with async/await and it makes
everything far easier to use. If you're unfamiliar with async/await, I ***highly*** recommend you
take the time to learn and familiarize yourself with it. You'll be so much happier when working with
the promises/asynchronous methods throughout the framework.
```
client.on('pause', async () => {
	await client.setDefaultSetting('prefix', '?');
	client.emit('continue');
});
```

All storage methods and methods that use storage internally are now asynchronous, so a strong understanding
of promises will benefit you heavily throughout your use of YAMDBF, and understanding of async/await will
benefit you even further than that.

As always, refer to the docs when you need information on anything, and feel free to ask questions on the
official server if you need further help.