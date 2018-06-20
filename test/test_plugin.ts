import { IPlugin } from '../src/client/interface/IPlugin';
import { Plugin } from '../src/client/Plugin';
import { Lang, Client, Logger } from '../src';
import { SharedProviderStorage } from '../src/storage/SharedProviderStorage';
import TestCommand from './commands/test_command';

export class TestPlugin extends Plugin implements IPlugin
{
	private readonly _client: Client;
	private _storage!: SharedProviderStorage;

	public name: string = 'TestPlugin';

	public constructor(client: Client)
	{
		super();
		this._client = client;
	}

	public async init(storage: SharedProviderStorage): Promise<void>
	{
		this._client.commands.registerExternal(new TestCommand());
		Lang.loadCommandLocalizationsFrom('./commands');
		Lang.loadLocalizationsFrom('./locale');

		// throw new Error('foo');

		this._storage = storage;
		await this._storage.set('foo', 'bar');
		Logger.instance('TestPlugin').debug(await this._storage.get('foo'));
	}
}
