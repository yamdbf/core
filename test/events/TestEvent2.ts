import { Message } from '../../bin/types/Message';
import { Event } from '../../bin/event/Event';

export default class extends Event
{
	public constructor() { super('noCommand'); }

	public action(message: Message)
	{
		console.log('Bar - No command found in message: ' + message.id);
	}
}
