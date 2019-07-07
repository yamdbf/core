import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { using } from '../CommandDecorators';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';
import { Util } from '../../util/Util';
import { inspect } from 'util';
import { FileOptions } from 'discord.js';

// @ts-ignore - Exposed for eval command invocations
const Discord = require('discord.js');
// @ts-ignore - Exposed for eval command invocations
const Yamdbf = require('../../index');

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'eval',
			desc: 'Evaluate provided Javascript code',
			usage: '<prefix>eval <...code>',
			ownerOnly: true
		});
	}

	@using(Middleware.localize)
	public async action(message: Message, [res]: [ResourceProxy]): Promise<any>
	{
		// @ts-ignore - Exposed for eval command invocations
		const client: Client = this.client;
		const [, , prefix, name] = await Util.wasCommandCalled(message);
		const call: RegExp = new RegExp(`^${Util.escape(prefix)} *${name}`);
		const code: string = message.content.replace(call, '').trim();

		if (!code) return this.respond(message, res.CMD_EVAL_ERR_NOCODE());

		let result!: string | object;
		let error!: string;
		let output: string;

		try { result = await eval(code); }
		catch (err) { error = err; }

		if (error) return this.respond(message, res.CMD_EVAL_ERROR({ code, error: this._clean(error) }));
		if (typeof result !== 'string') result = inspect(result, { depth: 0 });

		result = this._clean(result);
		output = res.CMD_EVAL_RESULT({ code, result });

		if (output.length > 2000)
		{
			const outputFile: Buffer = Buffer.from(result);
			const outputFileSize: number = outputFile.byteLength / 1024 / 1024;

			if (outputFileSize > 10)
			{
				const size: string = outputFileSize.toFixed(2) + ' MB';
				error = res.CMD_EVAL_ERR_OUTPUT_LENGTH_FAIL_FILESIZE({ size });
				output = res.CMD_EVAL_ERROR({ code, error });
				return this.respond( message, output);
			}

			result = res.CMD_EVAL_ERR_OUTPUT_LENGTH();
			output = res.CMD_EVAL_RESULT({ code, result });
			const files: FileOptions[] = [{ attachment: outputFile, name: 'output.txt' }];

			try
			{
				return await this.respond(message, output, { files });
			}
			catch
			{
				error = res.CMD_EVAL_ERR_OUTPUT_LENGTH_FAIL_UNKNOWN();
				output = res.CMD_EVAL_ERROR({ code, error });
				return this.respond(message, output);
			}
		}

		return this.respond(message, output);
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
