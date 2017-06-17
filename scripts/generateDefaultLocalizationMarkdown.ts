import * as fs from 'fs';
import { Client, LogLevel, Logger, ListenerUtil } from '../bin/';
import { Lang } from '../bin';
const config: any = require('../test/config.json');
const logger: Logger = Logger.instance();
const { once } = ListenerUtil;

class ScriptClient extends Client
{
	public constructor()
	{
		super({
			token: config.token,
			logLevel: LogLevel.NONE,
			passive: true
		});
	}

	@once('clientReady')
	private async _onClientReady(foo: string, bar: number): Promise<void>
	{
		logger.setLogLevel(LogLevel.DEBUG);
		logger.log('Script', 'Building localization string list');
		let localizationStrings: string[] = [];
		for (const raw of Object.keys(Lang.langs['en_us'].raw))
			localizationStrings.push(Lang.langs['en_us'].raw[raw]);

		const localizationMarkdownFileTemplate: string =
			fs.readFileSync('./static/DefaultLocalizationList.md.template').toString();

		logger.log('Script', 'Writing localization markdown file');
		fs.writeFileSync(
			'../examples/Localization.md',
			localizationMarkdownFileTemplate
				.replace('{{ localizationDefaults }}',
					localizationStrings
						.join('\n\n')
						.split(/\n/)
						.map(a => `\t${a}`)
						.join('\n')));

		logger.log('Script', 'Finished');
		process.exit();
	}
}
logger.log('Script', 'Starting localization markdown builder');
const script: ScriptClient = new ScriptClient();
script.start();

process.on('unhandledRejection', (err: any) => console.error(err));
