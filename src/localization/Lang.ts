import { LocalizedCommandInfo } from '../types/LocalizedCommandInfo';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import * as glob from 'glob';

/**
 * Class for loading localization files and fetching localized values
 */
export class Lang
{
	private static _instance: Lang;
	private client: Client;
	private commandInfo: { [command: string]: { [lang: string]: LocalizedCommandInfo } };
	private constructor(client: Client)
	{
		if (Lang._instance)
			throw new Error('Cannot create multiple instances of Lang singleton');

		this.client = client;
		this.commandInfo = {};
	}

	/**
	 * Create the singleton instance
	 */
	public static createInstance(client: Client): void
	{
		if (!Lang._instance) Lang._instance = new Lang(client);
	}

	/**
	 * Load any command localizations and assign them to commands
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
	}

	/**
	 * Get all available localization languages
	 * TODO: Extend this to scan language string files after
	 * adding support for those
	 */
	public static getLangs(): string[]
	{
		let langs: Set<string> = new Set();
		for (const commandName of Object.keys(Lang._instance.commandInfo))
			for (const lang of Object.keys(Lang._instance.commandInfo[commandName]))
				langs.add(lang);

		return Array.from(langs);
	}

	/**
	 * Get localized command info, defaulting to the info
	 * given in the Command's constructor
	 */
	public static getCommandInfo(command: Command, lang: string): LocalizedCommandInfo
	{
		let desc: string, info: string;
		if (!Lang._instance.commandInfo[command.name]
			|| (Lang._instance.commandInfo[command.name]
				&& !Lang._instance.commandInfo[command.name][lang]))
			return { desc, info } = command;

		desc = Lang._instance.commandInfo[command.name][lang].desc;
		info = Lang._instance.commandInfo[command.name][lang].info;
		if (!desc) desc = command.desc;
		if (!info) info = command.info;

		return { desc, info };
	}
}
