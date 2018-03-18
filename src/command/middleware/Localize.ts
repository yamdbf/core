import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceProxy } from '../../types/ResourceProxy';

export async function localize<T extends Command>(this: T, message: Message, args: any[]): Promise<[Message, any[]]>
{
	const lang: string = await Lang.getLangFromMessage(message);
	const res: ResourceProxy = Lang.createResourceProxy(lang);
	return [message, [res, ...args]];
}
