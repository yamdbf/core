import { Language } from './Language';
import { CompiledTemplateScript } from './CompiledTemplateScript';
import { LangStringNode } from './LangStringNode';

/**
 * Class for parsing `.lang` files
 * @private
 */
export class LangFileParser
{
	private static readonly _block: RegExp = /(\[(\w+)\]\n([\s\S]*?))(?=\n\n+?(?:## *.*\n)*\[\w+\]\n.+|\n*?$)/;
	private static readonly _blocks: RegExp = new RegExp(LangFileParser._block, 'g');

	private static readonly _comments: RegExp = /^(?!$)\s*##.*\n|##.*$/gm;
	private static readonly _outerNewLines: RegExp = /^\n|\n$/g;

	private static readonly _scriptTemplate: RegExp = /^{{!([\s\S]+?)!}}[\t ]*?\n?|{{!([\s\S]+?)!}}/m;
	private static readonly _scriptTemplates: RegExp = new RegExp(LangFileParser._scriptTemplate, 'gm');

	/**
	 * Parse a given language file string and return a Language
	 * object containing all the parsed nodes
	 */
	public static parseFile(langName: string, filePath: string, fileContents: string): Language
	{
		const lang: Language = new Language(langName);
		const blocks: string[] = fileContents.match(LangFileParser._blocks)!;

		if (!blocks)
			throw new Error(`The given Lang file contains no valid localization strings: ${filePath}`);

		for (const block of blocks)
		{
			const match: RegExpMatchArray = block.match(LangFileParser._block)!;
			const raw: string = match[1];
			const key: string = match[2];
			const scripts: CompiledTemplateScript[] = [];

			let value: string = match[3]
				.replace(LangFileParser._comments, '')
				.replace(LangFileParser._outerNewLines, '')
				.trim();

			// Process template scripts and replace with script token stubs
			if (LangFileParser._scriptTemplates.test(value))
			{
				const templates: RegExpMatchArray = value.match(LangFileParser._scriptTemplates)!;
				for (const script in templates)
				{
					const scriptData: string = templates[script];
					const functionBody: string =
						scriptData.match(LangFileParser._scriptTemplate)![1]
							|| scriptData.match(LangFileParser._scriptTemplate)![2];

					scripts.push(new CompiledTemplateScript(functionBody));

					value = value.replace(templates[script], `{{! ${script} !}}`);
				}
			}

			lang.strings[key] = new LangStringNode(langName, key, value, raw, scripts);
		}

		return lang;
	}
}
