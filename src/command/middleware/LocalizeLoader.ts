import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceLoader } from '../../types/ResourceLoader';

export async function localizeLoader<T extends Command>(this: T, message: Message, args: any[]): Promise<[Message, any[]]>
{
	const lang: string = await Lang.getLangFromMessage(message);
	const res: ResourceLoader = Lang.createResourceLoader(lang);
	return [message, [res, ...args]];
}
