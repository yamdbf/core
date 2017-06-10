import { Client, Command, Message, CommandDecorators, Logger, logger } from '../../bin';
const { using, guildOnly, group, ownerOnly } = CommandDecorators;
import { Middleware } from '../../bin';
import * as util from 'util';

@ownerOnly
@guildOnly
@group('test')
export default class extends Command
{
	@logger private readonly logger: Logger;
	public constructor()
	{
		super({
			name: 'test',
			description: 'test command',
			usage: '<prefix>test <test>'
		});
	}

	// @using((message, args) => [message, args.map(a => a.toUpperCase())])
	@using(Middleware.resolve({ '<test>': 'Member' }))
	// @using(Middleware.expect({ '<foo|bar|baz>': ['foo', 'bar', 'baz'] }))
	public action(message: Message, args: string[]): void
	{
		message.channel.send(args.join(' ') || 'MISSING ARGS');
		this.logger.debug('Command:test', util.inspect(this.group));
	}
}
