import { Message } from '../../types/Message';
import { Command } from '../Command';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'version',
			description: 'Get the version of the bot',
			usage: `<prefix>version`
		});
	}

	public action(message: Message): void
	{
		this.respond(message, `Current version is: **${this.client.version}**`);
	}
}
