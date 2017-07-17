import { Language } from './Language';

/**
 * Class for parsing `.lang` files
 * @private
 */
export class LangFileParser
{
	private static parseBlock: RegExp = /(\[(\w+)\]\n([\s\S]*?))(?=\n\n+?(?:## *.*\n)*\[\w+\]\n.+|\n*?$)/;
	private static parseBlocks: RegExp = new RegExp(LangFileParser.parseBlock, 'g');
	private static stripComments: RegExp = /^(?!$)\s*##.*\n|##.*$/gm;
	private static trimNewlines: RegExp = /^\n|\n$/g;

	/**
	 * Parse a given language file string and return a Language
	 * object containing all the parsed values
	 */
	public static parseFile(langName: string, fileContents: string): Language
	{
		const lang: Language = new Language(langName);
		const blocks: string[] = fileContents.match(LangFileParser.parseBlocks);
		for (const block of blocks)
		{
			const match: RegExpMatchArray = block.match(LangFileParser.parseBlock);
			const raw: string = match[1];
			const key: string = match[2];
			const value: string = match[3]
				.replace(LangFileParser.stripComments, '')
				.replace(LangFileParser.trimNewlines, '')
				.trim();

			lang.strings[key] = value;
			lang.raw[key] = raw;
		}
		return lang;
	}
}
