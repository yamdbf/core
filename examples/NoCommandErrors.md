If you're not receiving any error output from your commands and you are writing your commands without babel following the example on the main page, this is because error catching is handled in the pre-compiled code via a Promise catch. This doesn't translate well to non-babel code if you're using the example command as a base due to the Command action not being declared as `async`. Because commands are executed within a promise via `async`, they are effectively sandboxed so errors within your commands won't crash your bot but without access to that Promise catch, you won't see anything either.

If you're not receiving errors from your commands as a result of this, until `async`/`await` is implemented in Node, the best course of action is to surround the content of your Command action in a try/catch block. I'll demonstrate using the same `ping` command example from the main page.

```js
let Command = require('yamdbf').Command;

exports.default = class Ping extends Command
{
    constructor(bot)
    {
        super(bot, {
            name: 'ping',
            aliases: ['p'],
            description: 'Pong!',
            usage: '<prefix>ping',
            extraHelp: 'A basic ping/pong command example.',
            group: 'example',
            guildOnly: false,
            permissions: [],
            roles: [],
            ownerOnly: false
        });
    }

    action(message, args, mentions, original) // eslint-disable-line no-unused-vars
    {
		try
		{
			message.reply('Pong!');
		}
		catch (err)
		{
			console.error(err);
		}
    }
};
```
Just remember that despite not having access to `async` without babel, commands are still being executed asynchronously by the framework, and even still would be just by the fact that they're being dispatched from within the `'message'` event handler.

I'll make sure to make a big announcement when `async`/`await` can be used for writing commands with YAMDBF. In the meantime, this will have to do if you don't want to have to use babel to write commands with `async` in mind and want to be able to catch errors when debugging your commands.
