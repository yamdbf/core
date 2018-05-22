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

	public validate(value: any): boolean
	{
		return typeof value === 'string';
	}

	public resolveRaw(value: string | string[]): string
	{
		return value instanceof Array ? value.join('\n') : value.toString();
	}

	public resolve(_message: Message, _command: Command, _name: string, value: string | string[]): string
	{
		return this.resolveRaw(value);
	}
}
