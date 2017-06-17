import * as fs from 'fs';
import { LangFileParser } from './LangFileParser';
import { LangResourceFunction } from '../types/LangResourceFunction';
import { LocalizedCommandInfo } from '../types/LocalizedCommandInfo';
import { TokenReplaceData } from '../types/TokenReplaceData';
import { logger, Logger } from '../util/logger/Logger';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import { Language } from './Language';
import * as glob from 'glob';
import * as path from 'path';

/**
 * Singleton for loading localization files and fetching localized values
 */
export class Lang
{
	@logger private static logger: Logger;
	private static _instance: Lang;
	private client: Client;
	private commandInfo: { [command: string]: { [lang: string]: LocalizedCommandInfo } };
	private langs: { [lang: string]: Language };
	private constructor(client: Client)
	{
		if (Lang._instance)
			throw new Error('Cannot create multiple instances of Lang singleton');

		this.client = client;
		this.commandInfo = {};
		this.langs = {};
	}

	/**
	 * Contains all loaded languages and their strings.
	 * This does not include localized command helptext
	 * @type {object}
	 */
	public static get langs(): { [lang: string]: Language }
	{
		return Lang._instance.langs;
	}

	/**
	 * Get all available localization languages
	 * @type {string[]}
	 */
	public static get langNames(): string[]
	{
		let langs: Set<string> = new Set();
		for (const commandName of Object.keys(Lang._instance.commandInfo))
			for (const lang of Object.keys(Lang._instance.commandInfo[commandName]))
				langs.add(lang);

		for (const lang of Object.keys(Lang.langs)) langs.add(lang);

		return Array.from(langs);
	}

	/**
	 * Create the singleton instance
	 * @param {Client} client YAMDBF Client instance
	 * @returns {void}
	 */
	public static createInstance(client: Client): void
	{
		if (!Lang._instance) Lang._instance = new Lang(client);
	}

	/**
	 * Load localization files from the Client's `localeDir`
	 * @returns {void}
	 */
	public static loadLocalizations(): void
	{
		if (!Lang._instance) return;
		const langNameRegex: RegExp = /\/([^\/\.]+)(?:\..+)?\.lang/;

		let langs: { [key: string]: string[] } = {};
		let allLangFiles: string[] = [];
		allLangFiles.push(...glob.sync(`${path.join(__dirname, './en_us')}/**/*.lang`));
		if (Lang._instance.client.localeDir)
			allLangFiles.push(...glob.sync(`${Lang._instance.client.localeDir}/**/*.lang`));

		for (const langFile of allLangFiles)
		{
			if (!langNameRegex.test(langFile)) continue;
			const langName: string = langFile.match(langNameRegex)[1];
			if (!langs[langName]) langs[langName] = [];
			langs[langName].push(langFile);
		}

		for (const langName of Object.keys(langs))
		{
			for (const langFile of langs[langName])
			{
				if (!langNameRegex.test(langFile)) continue;
				const loadedLangFile: string = fs.readFileSync(langFile).toString();
				const parsedLanguageFile: Language = LangFileParser.parseFile(langName, loadedLangFile);

				if (typeof Lang._instance.langs[langName] !== 'undefined')
					Lang._instance.langs[langName].concat(parsedLanguageFile);
				else
					Lang._instance.langs[langName] = parsedLanguageFile;
			}
		}

		Lang.logger.info('Lang', `Loaded string localizations for ${Object.keys(Lang.langs).length} languages`);
	}

	/**
	 * Load any command localizations and assign them to commands
	 * @returns {void}
	 */
	public static loadCommandLocalizations(): void
	{
		if (!Lang._instance) return;

		for (const command of Lang._instance.client.commands.values())
		{
			let localizationFile: string =
				glob.sync(`${Lang._instance.client.commandsDir}/**/${command.name}.lang.json`)[0];
			if (!localizationFile) continue;
			let localizations: { [name: string]: LocalizedCommandInfo };
			try { localizations = require(localizationFile); }
			catch (err) { continue; }
			Lang._instance.commandInfo[command.name] = localizations;
		}

		const helpTextLangs: Set<string> = new Set();
		for (const command of Object.keys(Lang._instance.commandInfo))
			for (const lang of Object.keys(Lang._instance.commandInfo[command]))
				helpTextLangs.add(lang);

		Lang.logger.info('Lang', `Loaded helptext localizations for ${helpTextLangs.size} languages`);
	}

	/**
	 * Get localized Command info, defaulting to the info
	 * given in the Command's constructor
	 * @returns {LocalizedCommandInfo}
	 */
	public static getCommandInfo(command: Command, lang: string): LocalizedCommandInfo
	{
		let desc: string, info: string, usage: string;
		if (!Lang._instance.commandInfo[command.name]
			|| (Lang._instance.commandInfo[command.name]
				&& !Lang._instance.commandInfo[command.name][lang]))
			return { desc, info, usage } = command;

		desc = Lang._instance.commandInfo[command.name][lang].desc || command.desc;
		info = Lang._instance.commandInfo[command.name][lang].info || command.info;
		usage = Lang._instance.commandInfo[command.name][lang].usage || command.usage;

		return { desc, info, usage };
	}

	/**
	 * Get a string resource for the given language, replacing any
	 * template tokens with the given data
	 * @param {string} lang Language to get a string resource for
	 * @param {string} key String key to get
	 * @param {TokenReplaceData} [data] Values to replace in the string
	 * @returns {string}
	 */
	public static res(lang: string, key: string, data?: TokenReplaceData): string
	{
		if (!Lang.langs[lang]) return key;
		const maybeTemplates: RegExp = /^{{ *[a-zA-Z]+ *\?}}[\t ]*\n|{{ *[a-zA-Z]+ *\?}}/gm;
		const strings: { [key: string]: string } = Lang.langs[lang].strings;
		let loadedString: string = strings[key];

		if (!loadedString) return key;
		if (typeof data === 'undefined') return loadedString;

		for (const token of Object.keys(data))
		{
			// Skip maybe templates so they can be removed properly later
			if (new RegExp(`{{ *${token} *\\?}}`, 'g').test(loadedString)
				&& (data[token] === '' || data[token] === undefined)) continue;

			loadedString = loadedString.replace(new RegExp(`{{ *${token} *\\??}}`, 'g'), data[token]);
		}

		return loadedString.replace(maybeTemplates, '');
	}

	/**
	 * Takes a language string and returns a function that loads string
	 * resources for that specific language
	 * @param {string} lang The language to create a loader for
	 * @returns {LangResourceFunction}
	 */
	public static createResourceLoader(lang: string): LangResourceFunction
	{
		return (key: string, data?: TokenReplaceData) => Lang.res(lang, key, data);
	}
}
