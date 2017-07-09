import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceLoader } from '../../types/ResourceLoader';

export async function localize<T extends Command>(this: T, message: Message, args: any[]): Promise<[Message, any[]]>
{
	const dm: boolean = message.channel.type !== 'text';
	const lang: string = dm ? this.client.defaultLang
		: await message.guild.storage.settings.get('lang')
			|| this.client.defaultLang;

	const res: ResourceLoader = Lang.createResourceLoader(lang);
	return [message, [res, ...args]];
}
