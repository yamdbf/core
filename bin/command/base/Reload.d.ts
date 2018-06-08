import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceProxy } from '../../types/ResourceProxy';
export default class extends Command {
    private readonly _logger;
    constructor();
    action(message: Message, [res]: [ResourceProxy]): Promise<Message | Message[]>;
}
