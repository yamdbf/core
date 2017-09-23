import {
	Client,
	Command,
	LogLevel,
	Logger,
	ListenerUtil,
	// Util,
	Lang,
	Providers
} from '../bin/';
// import TestCommand from './commands/test_command';
import { TestPlugin } from './test_plugin';
const config: any = require('./config.json');
const logger: Logger = Logger.instance();
const { once } = ListenerUtil;

class Test extends Client
{
	public constructor()
	{
		super({
			token: config.token,
			owner: config.owner,
			readyText: 'Test client ready',
			statusText: 'Foo bar baz',
			provider: Providers.SQLiteProvider('sqlite://./db.sqlite', false),
			commandsDir: './commands',
			// localeDir: './locale',
			// defaultLang: 'al_bhed',
			pause: true,
			// plugins: [TestPlugin],
			// ratelimit: '5/10s',
			disableBase: ['setlang']
			// disableBase: Util.baseCommandNames
			// 	.filter(n => n !== 'help' && n !== 'eval')
		});

		Lang.setMetaValue('al_bhed', 'name', 'Al Bhed');
	}

	@once('pause')
	private async _onPause(): Promise<void>
	{
		logger.debug('Test', 'Paused...');
		await this.setDefaultSetting('prefix', '-');
		this.continue();
	}

	@once('continue')
	private _onContinue(): void
	{
		logger.debug('Test', 'Continuing');

		logger.warn('Test', 'Testing Logger#warn()');
		logger.debug('Test', 'Testing Logger#debug()');
		logger.error('Test', 'Testing Logger#error()');
	}

	@once('clientReady', 'foo', 1)
	private async _onClientReady(foo: string, bar: number): Promise<void>
	{
		logger.debug('Test', foo, bar.toString());
		await this.setDefaultSetting('foo', 'bar');
		this.on('command', (name, args, exec) => console.log(name, args, exec));
	}
}
const test: Test = new Test();
test.start();

process.on('unhandledRejection', (err: any) => console.error(err));
