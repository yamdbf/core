import { Client, LogLevel, Logger } from '../bin/';
const config: any = require('./config.json');
const logger: Logger = Logger.instance();

const client: Client = new Client({
	name: 'test',
	token: config.token,
	config: config,
	commandsDir: './commands',
	logLevel: LogLevel.DEBUG
}).start();

client.on('waiting', async () =>
{
	await client.setDefaultSetting('prefix', '.');
	client.emit('finished');
});
logger.warn('Test', 'Testing Logger#warn()');
logger.error('Test', 'Testing Logger#error()');
logger.debug('Test', 'Testing Logger#debug()');
