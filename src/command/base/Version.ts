import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import { Lang } from '../../localization/Lang';

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
	public action(message: Message, [lang]: [string]): void
	{
		this.respond(message, Lang.res(lang, 'CMD_VERSION_OUTPUT',
			{ version: this.client.version }));
	}
}
