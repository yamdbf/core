import { Client } from '../bin';
import * as path from 'path';
const config: any = require('./config.json');

const client: Client = new Client({
	name: 'test',
	token: config.token,
	config: config,
	commandsDir: path.join(__dirname, 'commands'),
	unknownCommandError: false
}).start();

client.on('waiting', () => client.emit('finished'));
client.on('clientReady', () => console.log('client ready'));
