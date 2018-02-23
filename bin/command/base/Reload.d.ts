import { ResourceLoader } from '../../types/ResourceLoader';
import { Message } from '../../types/Message';
import { Command } from '../Command';
export default class  extends Command {
    private readonly _logger;
    constructor();
    action(message: Message, [res]: [ResourceLoader]): Promise<Message | Message[]>;
}
