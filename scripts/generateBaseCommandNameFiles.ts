import * as fs from 'fs';
import { Client, LogLevel, Logger } from '../bin/';
const logger: Logger = Logger.instance();

class ScriptClient extends Client
{
	public constructor()
	{
		super({ logLevel: LogLevel.NONE });

		logger.setLogLevel(LogLevel.DEBUG);
		logger.log('Script', 'Building base command names files');
		let commands: string[] = Array.from(
			new Set(this.commands
				.map(c => c.name)
				.concat(this.disableBase)))
			.sort();
		let baseCommandNamesTypeFile: string = `// Generated automatically at ${new Date().toString()}

/**
 * @typedef {string} BaseCommandName String representing a name of a base command. Valid names are:
 * \`\`\`
${commands.map(c => ` * '${c}'`).join(',\n')}
 * \`\`\`
 */

export type BaseCommandName = ${commands.map(c => `'${c}'`).join('\n\t| ')};
`;

		logger.log('Script', 'Writing base command names files');
		fs.writeFileSync('../src/types/BaseCommandName.ts', baseCommandNamesTypeFile);
		fs.writeFileSync('../src/util/static/baseCommandNames.json', JSON.stringify(commands));

		logger.log('Script', 'Finished');
		process.exit();
	}
}
logger.log('Script', 'Starting base command names file builder');
const script: ScriptClient = new ScriptClient();

process.on('unhandledRejection', (err: any) => logger.error(err));
