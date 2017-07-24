import * as fs from 'fs';
import { Client, LogLevel, Logger, Lang } from '../bin/';
const logger: Logger = Logger.instance();

class ScriptClient extends Client
{
	public constructor()
	{
		super({ logLevel: LogLevel.NONE });

		logger.setLogLevel(LogLevel.DEBUG);
		logger.log('Script', 'Building base string key enum');
		const strings: string[] = Object.keys(Lang.langs['en_us'].strings);

		let localizationStringsEnumFile: string = `// Generated automatically at ${new Date().toString()}

/**
 * @typedef {enum} BaseStrings Enum containing all base framework
 * localization string keys
 */
export enum BaseStrings
{
	${strings.map(c => `${c} = '${c}'`).join(',\n\t')}
}
`;

		logger.log('Script', 'Writing base string key enum file');
		fs.writeFileSync('../src/localization/BaseStrings.ts', localizationStringsEnumFile);

		logger.log('Script', 'Finished');
		process.exit();
	}
}
logger.log('Script', 'Starting base string key enum file builder');
const script: ScriptClient = new ScriptClient();

process.on('unhandledRejection', (err: any) => logger.error(err));
