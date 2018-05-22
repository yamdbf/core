import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { Util } from '../../../util/Util';

export class CommandGroupResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'CommandGroup');
	}

	public validate(value: any): boolean
	{
		return this.client.commands.groups.includes(value);
	}

	public resolveRaw(value: string): string | undefined
	{
		return this.client.commands.groups
			.find(g => Util.normalize(g).includes(Util.normalize(value)));
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<string>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const result: string = this.resolveRaw(value)!;
		if (!result)
			throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'CommandGroup' }));

		return result;
	}
}
