const { Client } = require('@yamdbf/core');
const config = require('./config.json');
const path = require('path');

const client = new Client({
	token: config.token,
	owner: config.owner,
	statusText: 'try @mention help',
	readyText: 'Client is ready!',
	commandsDir: path.join(__dirname, 'commands')
}).start();

client.once('clientReady', () => {
	console.log(`Client ready! Serving ${client.guilds.size} guilds.`);
});
