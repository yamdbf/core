import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { inspect } from 'util';
import * as fs from 'fs';
const Discord = require('discord.js'); // tslint:disable-line
const Yamdbf = require('../../index'); // tslint:disable-line

let ts: any;
try { ts = require('typescript'); }
catch (err) {}

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'eval:ts',
			description: 'Evaluate provided Typescript code',
			usage: '<prefix>eval:ts <...code>',
			extraHelp: 'Runs pretty slowly due to having to run diagnostics before compiling. If Typescript is not installed the provided code will be evaluated as Javascript and diagnostics/compilation will be skipped.',
			ownerOnly: true
		});
	}

	public async action(message: Message): Promise<any>
	{
		const code: string = message.content.split(this.name).slice(1).join(this.name).trim();
		if (!code)
		{
			this.respond(message, '**ERROR:** ```xl\nNo code provided to evaluate.\n```');
			return;
		}

		let start: Message = ts ? <Message> await this.respond(message, '*Compiling...*') : message;
		let evaled: string | Promise<string | object>;
		try
		{
			const compiled: string = this._compile(code);
			message.channel.send(compiled);
			evaled = eval(compiled);
		}
		catch (err)
		{
			return start.edit(
				`**INPUT:**\n\`\`\`ts\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
		}
		if (evaled instanceof Promise)
		{
			evaled.then(res =>
			{
				if (typeof res !== 'string') res = inspect(res, { depth: 0 });
				start.edit(
					`**INPUT:**\n\`\`\`ts\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(res)}\n\`\`\``);
			})
			.catch(err =>
			{
				start.edit(
					`**INPUT:**\n\`\`\`ts\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
			});
		}
		else
		{
			if (typeof evaled !== 'string')	evaled = inspect(evaled, { depth: 0 });
			return start.edit(
				`**INPUT:**\n\`\`\`ts\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(evaled)}\n\`\`\``);
		}
	}

	private _compile(code: string): string
	{
		let message: string;
		if (ts)
		{
			const fileName: string = `${__dirname}/eval${Date.now()}.ts`;
			fs.writeFileSync(fileName, code);
			const program: any = ts.createProgram([fileName], { module: ts.ModuleKind.CommonJS });
			const diagnostic: any = ts.getPreEmitDiagnostics(program)[0];
			if (diagnostic)
			{
				const messageText: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
				const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
				if (!messageText.includes('Cannot find name'))
					message = `(${line + 1},${character + 1}): ${messageText} (${diagnostic.code})`;
			}
			fs.unlinkSync(fileName);
		}
		if (message) throw Error(message);
		return ts ? ts.transpileModule(code,
			{ compilerOptions: { module: ts.ModuleKind.CommonJS } })
				.outputText
				.replace('"use strict";\r\nexports.__esModule = true;\r\n', '')
			: code;
	}

	private _clean(text: string): string
	{
		return typeof text === 'string' ? text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(/[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g, '[REDACTED]')
			.replace(/email: '[^']+'/g, `email: '[REDACTED]'`)
			: text;
	}
}
