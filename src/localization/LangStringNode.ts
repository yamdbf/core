import { CompiledTemplateScript } from './CompiledTemplateScript';
import { TemplateData } from '../types/TemplateData';

/**
 * Represents a localization string parsed and compiled from a .lang file,
 * capable of validating arguments it expects at runtime
 * @private
 */
export class LangStringNode
{
	public readonly lang: string;
	public readonly key: string;
	public readonly value: string;
	public readonly raw: string;
	public readonly scripts: CompiledTemplateScript[];
	public readonly args: { [key: string]: { optional: boolean, type: string } };
	public readonly argsValidator: ((args: TemplateData) => void) | undefined;

	private static readonly _argsDirective: RegExp = /^(##! *<[^>]+?>)/m;
	private static readonly _validArgsDirective: RegExp = /^##! *(?!< *, *)<(?:(?: *, *)?\w+\?? *: *\w+(?:\[\])?)+>/m;
	private static readonly _argList: RegExp = /<([^>]+?)>/;
	private static readonly _allArgs: RegExp = /\w+\?? *: *\w+(?:\[\])?/g;
	private static readonly _singleArg: RegExp = /(\w+\??) *: *(\w+(?:\[\])?)/;
	private static readonly _validArgTypes: string[] = ['string', 'number', 'boolean', 'any'];

	public constructor(lang: string, key: string, value: string, raw: string, scripts: CompiledTemplateScript[])
	{
		this.lang = lang;
		this.key = key;
		this.value = value;
		this.raw = raw;
		this.scripts = scripts;
		this.args = {};

		if (LangStringNode._argsDirective.test(raw))
		{
			if (!LangStringNode._validArgsDirective.test(raw))
				throw new TypeError(`in string \`${lang}::${key}\`: Malformed args directive`);

			const directive: string = raw.match(LangStringNode._argsDirective)![1];
			const argList: string = directive.match(LangStringNode._argList)![1];
			const allArgs: string[] = argList.match(LangStringNode._allArgs)!;

			// Return whether or not the given type is an array type
			const isArrayType: (type: string) => boolean = type => /\w+\[\]/.test(type);

			// Return whether or not the given arg is optional
			const isOptionalArg: (arg: string) => boolean = arg => /\w+\?/.test(arg);

			// Throw a type error if the given type is not valid
			const validateType: (type: string, val: any, arg: string, array: boolean) => void =
				(type, val, arg, array) => {
					if (type === 'any') return;
					if (typeof val === type) return;

					throw new TypeError([
						`String \`${lang}::${key}\`, ${array ? 'array ' : ''}arg \`${arg}\`:`,
						`Expected type \`${type}\`, got ${typeof val}`
					].join(' '));
				};

			// Process the lang string args directive and save the
			// argument type info for later use by the args validator
			for (const arg of allArgs)
			{
				const parsedArg: RegExpMatchArray = arg.match(LangStringNode._singleArg)!;
				const argKey: string = parsedArg[1];
				const argType: string = parsedArg[2];
				const rawKey: string = isOptionalArg(argKey) ? argKey.slice(0, -1) : argKey;
				const rawType: string = isArrayType(argType) ? argType.slice(0, -2) : argType;

				if (!LangStringNode._validArgTypes.includes(rawType))
					throw new TypeError(`in string \`${lang}::${key}\`: Type \`${argType}\` is not a valid arg type`);

				this.args[rawKey] = { optional: isOptionalArg(argKey), type: argType };
			}

			// Create and assign the args validator for this node
			this.argsValidator = args => {
				for (const argKey in this.args)
				{
					const arg: { optional: boolean, type: string } = this.args[argKey];
					const rawType: string = isArrayType(arg.type) ? arg.type.slice(0, -2) : arg.type;

					if (arg.optional && typeof args[argKey] === 'undefined') continue;
					if (typeof args[argKey] === 'undefined')
						throw new TypeError([
							`String \`${lang}::${key}\`, arg \`${argKey}\`:`,
							`Expected type \`${arg.type}\`, got undefined`
						].join(' '));

					if (isArrayType(arg.type))
					{
						if (!Array.isArray(args[argKey]))
							throw new TypeError(`String \`${lang}::${key}\`, arg \`${argKey}\`: Expected Array`);

						for (const val of args[argKey] as Array<any>)
							validateType(rawType, val, argKey, true);
					}
					else validateType(rawType, args[argKey], argKey, false);
				}
			};
		}
	}
}
