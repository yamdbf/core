import * as fs from 'fs';
import { Client, LogLevel, Logger, Lang } from '../bin/';
const logger: Logger = Logger.instance();

class ScriptClient extends Client
{
	public constructor()
	{
		super({ logLevel: LogLevel.NONE, passive: true });

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

process.on('unhandledRejection', (err: any) => logger.error(err));
