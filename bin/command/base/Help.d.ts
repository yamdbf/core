import { ResourceProxy } from '../../types/ResourceProxy';
import { Message } from '../../types/Message';
import { Command } from '../Command';
export default class extends Command {
    constructor();
    action(message: Message, [res, commandName]: [ResourceProxy, string]): Promise<void>;
}
