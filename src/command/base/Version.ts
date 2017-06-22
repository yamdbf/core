import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import { ResourceLoader } from '../../types/ResourceLoader';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'version',
			desc: 'Get the version of the bot',
			usage: `<prefix>version`
		});
	}

	@localizable
	public action(message: Message, [res]: [ResourceLoader]): void
	{
		this.respond(message, res('CMD_VERSION_OUTPUT', { version: this.client.version }));
	}
}
