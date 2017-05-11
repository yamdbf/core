import { Client, LogLevel, Logger, ListenerUtil } from '../bin/';
const config: any = require('./config.json');
const logger: Logger = Logger.instance();
const { once } = ListenerUtil;

// const client: Client = new Client({
// 	name: 'test',
// 	token: config.token,
// 	config: config,
// 	commandsDir: './commands',
// 	logLevel: LogLevel.DEBUG
// }).start();

// client.on('waiting', async () =>
// {
// 	await client.setDefaultSetting('prefix', '.');
// 	client.emit('finished');
// });
// logger.warn('Test', 'Testing Logger#warn()');
// logger.error('Test', 'Testing Logger#error()');
// logger.debug('Test', 'Testing Logger#debug()');

class Test extends Client
{
	public constructor()
	{
		super({
			name: 'test',
			token: config.token,
			config: config,
			commandsDir: './commands',
			logLevel: LogLevel.DEBUG
		});
	}

	@once('waiting')
	private async _onWaiting(): Promise<void>
	{
		logger.debug('Test', 'Waiting...');
		await this.setDefaultSetting('prefix', '?');
		this.emit('finished');
	}

	@once('finished')
	private _onFinished(): void
	{
		logger.debug('Test', 'Finished');

		logger.warn('Test', 'Testing Logger#warn()');
		logger.debug('Test', 'Testing Logger#debug()');
		logger.error('Test', 'Testing Logger#error()');
	}
}
const test: Test = new Test();
test.start();
