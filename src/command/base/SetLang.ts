import { Command } from '../Command';
import { Lang } from '../../localization/Lang';
import { Message } from '../../types/Message';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';
import { using } from '../CommandDecorators';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'setlang',
			aliases: ['lang'],
			desc: 'List languages or set bot language',
			usage: '<prefix>setlang [lang]',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.resolve('lang?: Number'))
	@using(Middleware.localize)
	public async action(message: Message, [res, lang]: [ResourceProxy, number]): Promise<any>
	{
		const langs: string[] = Lang.langNames;
		if (typeof lang === 'undefined')
		{
			const prefix: string = await this.client.getPrefix(message.guild) || '';
			let names: string[] = langs.map(l => Lang.getMetaValue(l, 'name') || l);
			let currentLang: string = await message.guild.storage!.settings.get('lang') || 'en_us';
			currentLang = Lang.getMetaValue(currentLang, 'name') || currentLang;
			names = names
				.map((l, i) => `${i + 1}:  ${l}`)
				.map(l => l.replace(` ${currentLang}`, `*${currentLang}`));

			const output: string = res.CMD_SETLANG_LIST({ langList: names.join('\n'), prefix });
			return message.channel.send(output);
		}

		if (!(lang - 1 in langs))
			return message.channel.send(res.CMD_SETLANG_ERR_INVALID());

		const newLang: string = langs[lang - 1];
		await message.guild.storage!.settings.set('lang', newLang);

		// eslint-disable-next-line no-param-reassign
		res = Lang.createResourceProxy(newLang);
		const langName: string = Lang.getMetaValue(newLang, 'name') || newLang;
		return message.channel.send(res.CMD_SETLANG_SUCCESS({ lang: langName }));
	}
}
