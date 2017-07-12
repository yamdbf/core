import { IPlugin } from '../bin/client/interface/IPlugin';
import { Plugin } from '../bin/client/Plugin';
import { Lang } from '../bin';
import TestCommand from './commands/test_command';

export class TestPlugin extends Plugin implements IPlugin
{
	public name: string = 'TestPlugin';
	public async init(): Promise<void>
	{
		this.client.commands.registerExternal(this.client, new TestCommand());
		Lang.loadCommandLocalizationsFrom('./commands');
	}
}
