import {
	Client,
	Command,
	Message,
	CommandDecorators,
	Logger,
	logger,
	ResourceLoader,
	Middleware
} from '../../bin';
import * as util from 'util';
const { using, guildOnly, group, ownerOnly } = CommandDecorators;
const { resolve, expect, localize } = Middleware;

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
			usage: '<prefix>test <test> <foo>',
			// overloads: 'ping',
			ratelimit: '2/10s'
		});
	}

	// @using((message, args) => [message, args.map(a => a.toUpperCase())])
	@using(resolve(`test: Number, foo: String`))
	@using(expect(`test: Number, foo: ['foo', 'bar']`))
	@using(localize)
	public action(message: Message, [res, ...args]: [ResourceLoader, string[]]): void
	{
		message.channel.send(res('FOO_BAR_BAZ'));
		message.channel.send(args.join(' ') || 'MISSING ARGS');
		this.logger.debug('Command:test', util.inspect(this.group));
		throw new Error('foo');
	}
}
