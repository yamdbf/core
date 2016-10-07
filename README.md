# YAMDBF: Yet Another Modular Discord Bot Framework

[![Discord](https://discordapp.com/api/guilds/233751981838041090/embed.png)](https://discord.gg/WN78NuR)
[![npm](https://img.shields.io/npm/v/yamdbf.svg?maxAge=3600)](https://www.npmjs.com/package/yamdbf)
[![David](https://img.shields.io/david/zajrik/yamdbf.svg?maxAge=3600)](https://david-dm.org/zajrik/yamdbf)

[![NPM](https://nodei.co/npm/yamdbf.png?downloads=true&stars=true)](https://nodei.co/npm/yamdbf/)

A Discord.js-based Discord Bot framework to be used as a base for quick bot development.

Usage of the framework is pretty simple. `npm install --save yamdbf` in your project folder, create a folder to put commands in, rename `config.json.example` to `config.json`, fill in the values, and create a basic bot script.

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

And that's all it takes! Just that and you have a fully functioning bot with the base commands available in the framework. After that you'll just need to write your own commands. I prefer using Babel so that I can use syntax that Node doesn't yet have but for the sake of usability I'll provide an example command using currently-native Node syntax:

```js
let Command = require('yamdbf').Command;

exports.default = class Example extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'example',
			aliases: ['ex, e'],
			description: 'An example command',
			usage: '<prefix>example',
			extraHelp: 'An example command to show the basic boilerplate for writing a command.',
			group: 'example',
			guildOnly: false,
			permissions: [],
			roles: [],
			ownerOnly: false
		});
	}

	action(message, args, mentions, original)
	{
		message.channel.sendMessage(message.content);
    	console.log(this.bot.version);
	}
};

```

It should be noted that command actions have access to the Discord.js Client instance via `this.bot` as seen in the example command above.

That's about it for creating a bot and adding commands. Proper documentation will come soon. 👌
