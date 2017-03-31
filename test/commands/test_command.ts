import { Bot, Command, Message, CommandDecorators } from '../../bin';
const { using, guildOnly } = CommandDecorators;

@guildOnly
export default class extends Command<Bot>
{
	public constructor(client: Bot)
	{
		super(client, {
			name: 'test',
			description: 'test command',
			usage: '<prefix>test',
			group: 'test'
		});
	}

	@using((message, args) => [message, args.map(a => a.toUpperCase())])
	public action(message: Message, args: string[]): void
	{
		message.channel.send(args.join(' '));
	}
}
