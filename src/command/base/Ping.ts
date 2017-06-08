import { Message } from '../../types/Message';
import { Command } from '../Command';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'ping',
			description: 'Pong!',
			usage: '<prefix>ping'
		});
	}

	public async action(message: Message): Promise<void>
	{
		let msg: Message;
		if (this.client.selfbot) msg = <Message> await message.edit('Pong!');
		else msg = <Message> await message.channel.send('Pong!');
		msg.edit(`Pong! (${msg.createdTimestamp - message.createdTimestamp}ms)`);
	}
}
