import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';
import { Util } from '../../../util/Util';

export class CommandGroupResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'CommandGroup');
	}

	public async validate(value: any): Promise<boolean>
	{
		return this.client.commands.groups.includes(value);
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<string>
	{
		const dm: boolean = message.channel.type !== 'text';
		const lang: string = dm
			? this.client.defaultLang
			: await message.guild.storage.settings.get('lang')
				|| this.client.defaultLang;

		const res: ResourceLoader = Lang.createResourceLoader(lang);
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const result: string = this.client.commands.groups
			.find(g => Util.normalize(g).includes(Util.normalize(value)));

		if (!result)
			throw new Error(res(s.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg: value, usage, type: 'CommandGroup' }));

		return result;
	}
}
