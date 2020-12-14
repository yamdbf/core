import { Command } from '../Command';
import { Message } from '../../types/Message';

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
		const msg: Message = await message.channel.send('Pong!') as Message;
		msg.edit(`Pong! (${msg.createdTimestamp - message.createdTimestamp}ms)`);
	}
}
