const { Bot } = require('../bin/');
const config = require('./config.json');
const path = require('path');

const client = new Bot({
	name: 'test',
	token: config.token,
	config: config,
	commandsDir: path.join(__dirname, 'commands'),
	unknownCommandError: false
}).start();

client.on('waiting', () => client.emit('finished'));
client.on('clientReady', () => console.log('client ready'));
