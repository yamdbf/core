# YAMDBF: Yet Another Modular Discord Bot Framework

[![Discord](https://discordapp.com/api/guilds/233751981838041090/embed.png)](https://discord.gg/cMXkbXV)
[![npm](https://img.shields.io/npm/v/yamdbf.svg?maxAge=3600)](https://www.npmjs.com/package/yamdbf)
[![David](https://img.shields.io/david/zajrik/yamdbf.svg?maxAge=3600)](https://david-dm.org/zajrik/yamdbf)
[![CircleCI](https://circleci.com/gh/zajrik/yamdbf.svg?style=shield)](https://circleci.com/gh/zajrik/yamdbf)

[![NPM](https://nodei.co/npm/yamdbf.png?downloads=true&stars=true)](https://nodei.co/npm/yamdbf/)

A Discord.js-based Discord Bot framework to be used as a base for quick bot development.

Usage of the framework is pretty simple. Run `npm install --save yamdbf` in your project folder, create a folder to put commands in, create a file named `config.json` that looks like this:
```
{
	"token": "token",
	"owner": ["ownerid"]
}
```
Then fill in the values and create a basic bot script.

A basic bot script will look something like this

```js
const Bot = require('yamdbf').Bot;
const config = require('./config.json');
const path = require('path');
const bot = new Bot({
	name: 'bot',
	token: config.token,
	config: config,
	selfbot: false,
	version: '1.0.0',
	statusText: 'try @mention help',
	commandsDir: path.join(__dirname, 'commands')
}).start();
```

And that's all it takes! Just that and you have a fully functioning bot with the base commands available in the framework. After that you'll just need to write your own commands. Here's an example command:

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
		message.reply('Pong!');
	}
};
```

It should be noted that command actions have access to the Discord.js Client instance via `this.bot`.

That's about it for creating a bot and adding commands. If you don't want to have to copy and paste templates all the time or look at them for examples, a [Yeoman generator](https://github.com/zajrik/generator-yamdbf) has been written that can be used for creating new bot projects and new commands from the command line. It's very handy!

# Links
- [YAMDBF Documentation](https://yamdbf.js.org)
- [YAMDBF Discord server](https://discord.gg/cMXkbXV)
- [YAMDBF GitHub](https://github.com/zajrik/yamdbf)
- [YAMDBF Issues](https://github.com/zajrik/yamdbf/issues)
- [YAMDBF Generator](https://github.com/zajrik/generator-yamdbf)
- [YAMDBF NPM](https://www.npmjs.com/package/yamdbf)
