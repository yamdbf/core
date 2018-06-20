import { Resolver, Client, Command, Message } from '../src/';

export class EvenNumberResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'EvenNumber', 'Even');
	}

	public async validate(value: any): Promise<boolean>
	{
		return (typeof value === 'number' && !isNaN(value) && isFinite(value)) && (value % 2) === 0;
	}

	public async resolve(_message: Message, _command: Command, _name: string, value: string): Promise<number>
	{
		const result: number = parseFloat(value);
		if (!(await this.validate(result)))
			throw new Error(`Value \`${value}\` is not an even number`);

		return result;
	}
}
