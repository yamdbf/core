const { Client } = require('@yamdbf/core');
const config = require('./config.json');
const path = require('path');

class CustomClient extends Client
{
	constructor()
	{
		super({
			token: config.token,
			owner: config.owner,
			statusText: 'try @mention help',
			readyText: 'Client is ready!',
			commandsDir: path.join(__dirname, 'commands'),
			pause: true
		});

		this.once('pause', async () => {
			await this.setDefaultSetting('prefix', '-');
			await this.setDefaultSetting('foo', 'bar');
			this.continue();
		});

		this.once('clientReady', () => {
			console.log(`Client ready! Serving ${this.guilds.size} guilds.`);
		});
	}
}
const client = new CustomClient().start();
