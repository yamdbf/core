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
