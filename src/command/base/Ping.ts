import { Message } from '../../types/Message';
import { Command } from '../Command';

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'ping',
			desc: 'Pong!',
			usage: '<prefix>ping'
		});
	}

	public async action(message: Message): Promise<void>
	{
		let msg = <Message> await message.channel.send('Pong!');
		msg.edit(`Pong! (${msg.createdTimestamp - message.createdTimestamp}ms)`);
	}
}
