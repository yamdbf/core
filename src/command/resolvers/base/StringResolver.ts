import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';

export class StringResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'String', 'string');
	}

	public async validate(value: any): Promise<boolean>
	{
		return typeof value === 'string';
	}

	public async resolve(message: Message, command: Command, name: string, value: string | string[]): Promise<string>
	{
		return value instanceof Array ? value.join('\n') : value.toString();
	}
}
