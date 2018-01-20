import { Resolver, Client, Command, Message } from '../bin/';

export class EvenNumberResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'EvenNumber');
	}

	public async validate(value: any): Promise<boolean>
	{
		return (typeof value === 'number' && !isNaN(value) && isFinite(value)) && (value % 2) === 0;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<number>
	{
		const result: number = parseFloat(value);
		if (!(await this.validate(result)))
			throw new Error(`Value \`${value}\` is not an even number`);

		return result;
	}
}
