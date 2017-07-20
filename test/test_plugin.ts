import { IPlugin } from '../bin/client/interface/IPlugin';
import { Plugin } from '../bin/client/Plugin';
import { Lang, Client } from '../bin';
import TestCommand from './commands/test_command';

export class TestPlugin extends Plugin implements IPlugin
{
	public name: string = 'TestPlugin';
	private client: Client;

	public constructor(client: Client)
	{
		super();
		this.client = client;
	}

	public async init(): Promise<void>
	{
		this.client.commands.registerExternal(new TestCommand());
		// Lang.loadCommandLocalizationsFrom('./commands');
		// Lang.loadLocalizationsFrom('./locale');
		// throw new Error('foo');
	}
}
