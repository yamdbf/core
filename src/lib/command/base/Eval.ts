import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { inspect } from 'util';
const Discord = require('discord.js'); // tslint:disable-line
const Yamdbf = require('../../../index'); // tslint:disable-line

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'eval',
			description: 'Evaluate provided Javascript code',
			usage: '<prefix>eval <code>',
			ownerOnly: true
		});
	}

	public action(message: Message): any
	{
		const code: string = message.content.split(this.name).slice(1).join(this.name).trim();
		if (!code)
		{
			this.respond(message, '**ERROR:** ```xl\nNo code provided to evaluate.\n```');
			return;
		}

		let evaled: string | Promise<string | object>;
		try
		{
			evaled = eval(code);
		}
		catch (err)
		{
			return this.respond(message,
				`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
		}
		if (evaled instanceof Promise)
		{
			evaled.then(res =>
			{
				if (typeof res !== 'string') res = inspect(res, { depth: 0 });
				this.respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(res)}\n\`\`\``);
			})
			.catch(err =>
			{
				this.respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
			});
		}
		else
		{
			if (typeof evaled !== 'string')	evaled = inspect(evaled, { depth: 0 });
			return this.respond(message,
				`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(evaled)}\n\`\`\``);
		}
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
