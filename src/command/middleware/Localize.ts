import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';

export async function localize<T extends Command>(this: T, message: Message, args: any[]): Promise<[Message, any[]]>
{
	const dm: boolean = message.channel.type !== 'text';
	const lang: string = dm ? this.client.defaultLang
		:  await message.guild.storage.settings.get('lang');
	return [message, [lang, ...args]];
}
