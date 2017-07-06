import { Client, Command, Message, CommandDecorators, Logger, logger } from '../../bin';
import { Middleware } from '../../bin';
import * as util from 'util';
const { using, guildOnly, group, ownerOnly } = CommandDecorators;
const { resolve, expect } = Middleware;

// @ownerOnly
// @guildOnly
@group('test')
export default class extends Command
{
	@logger private readonly logger: Logger;
	public constructor()
	{
		super({
			name: 'test',
			aliases: ['testing', 'testo'],
			desc: 'test command',
			usage: '<prefix>test <test> <foo>'
		});
	}

	// @using((message, args) => [message, args.map(a => a.toUpperCase())])
	@using(resolve(`test: Number, foo: String`))
	@using(expect(`test: Number, foo: ['foo', 'bar']`))
	public action(message: Message, args: string[]): void
	{
		message.channel.send(args.join(' ') || 'MISSING ARGS');
		this.logger.debug('Command:test', util.inspect(this.group));
	}
}
