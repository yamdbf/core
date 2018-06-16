import * as fs from 'fs';
import * as path from 'path';
import { Client, LogLevel, Logger, Lang } from '../bin/';
const logger: Logger = Logger.instance();

class ScriptClient extends Client
{
	public constructor()
	{
		super({ logLevel: LogLevel.NONE });
		this.disableBase.shift();
		(<any> this)._commandLoader.loadCommandsFrom(path.join(__dirname, '../bin/command/base'), true);

		logger.setLogLevel(LogLevel.DEBUG);
		logger.log('Script', 'Building localization string list');
		let localizationStrings: string[] = [];
		for (const key of Object.keys(Lang.langs['en_us'].strings))
			localizationStrings.push(Lang.langs['en_us'].strings[key].raw);

		type CommandInfo = {
			[commandName: string]: {
				[langName: string]: {
					desc: string;
					info?: string;
					usage: string;
				}
			}
		};

		let commandHelptextStrings: CommandInfo = {};
		for (const command of this.commands.values())
		{
			commandHelptextStrings[command.name] = {
				'en_us': {
					desc: command.desc,
					usage: command.usage
				}
			};
			if (command.info) commandHelptextStrings[command.name]['en_us'].info = command.info;
		}

		const commandHelptextMarkdownTemplate: string =
			fs.readFileSync('./static/CommandHelptextLocalization.md.template').toString();

		const localizationStringMarkdownTemplate: string =
			fs.readFileSync('./static/LocalizationStringList.md.template').toString();

		logger.log('Script', 'Writing localization markdown file');
		fs.writeFileSync(
			'../examples/LocalizationStrings.md',
			localizationStringMarkdownTemplate
				.replace('{{ localizationDefaults }}',
					localizationStrings
						.join('\n\n')
						.split(/\n/)
						.map(a => `\t${a}`)
						.join('\n')));

		logger.log('Script', 'Writing command helptext markdown file');
		fs.writeFileSync(
			'../examples/LocalizationHelptext.md',
			commandHelptextMarkdownTemplate
				.replace('{{ localizationStrings }}',
					JSON.stringify(commandHelptextStrings, null, '\t')
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
