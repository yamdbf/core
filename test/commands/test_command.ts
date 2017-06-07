import { Client, Command, Message, CommandDecorators, Logger, logger } from '../../bin';
const { using, guildOnly, group } = CommandDecorators;
import { Middleware } from '../../bin';
import * as util from 'util';

@guildOnly
@group('test')
export default class extends Command<Client>
{
	@logger private readonly logger: Logger;
	public constructor(client: Client)
	{
		super(client, {
			name: 'test',
			description: 'test command',
			usage: '<prefix>test <foo|bar|baz>'
		});
	}

	@using((message, args) => [message, args.map(a => a.toUpperCase())])
	@using(Middleware.resolveArgs({ '<test>': 'Duration' }))
	// @using(Middleware.expect({ '<foo|bar|baz>': ['foo', 'bar', 'baz'] }))
	public action(message: Message, args: string[]): void
	{
		message.channel.send(args.join(' ') || 'MISSING ARGS');
		this.logger.debug('Command:test', util.inspect(this.group));
	}
}
