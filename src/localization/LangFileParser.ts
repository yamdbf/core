import { Language } from './Language';

/**
 * Class for parsing `.lang` files
 * @private
 */
export class LangFileParser
{
	private static parseBlock: RegExp = /(\[([a-zA-Z0-9_]+)\]([^]+)\[\/\2\])/;
	private static parseBlocks: RegExp = new RegExp(LangFileParser.parseBlock, 'g');
	private static stripComments: RegExp = /^(?!$)\s*##.*\n|##.*$/gm;
	private static trimNewlines: RegExp = /^\n|\n$/g;

	/**
	 * Parse a given language file string and return a Language
	 * object containing all the parsed values
	 */
	public static parseFile(langName: string, langFile: string): Language
	{
		const lang: Language = new Language(langName);
		const blocks: string[] = langFile.match(LangFileParser.parseBlocks);
		for (const block of blocks)
		{
			const match: RegExpMatchArray = block.match(LangFileParser.parseBlock);
			const raw: string = match[1].replace(/\r\n/g, '\n');
			const key: string = match[2];
			const value: string = match[3]
				.replace(/\r\n/g, '\n')
				.replace(LangFileParser.stripComments, '')
				.replace(LangFileParser.trimNewlines, '')
				.trim();

			lang.strings[key] = value;
			lang.raw[key] = raw;
		}
		return lang;
	}
}
