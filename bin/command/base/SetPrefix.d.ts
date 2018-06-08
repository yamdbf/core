import { Command } from '../Command';
import { Message } from '../../types/Message';
import { ResourceProxy } from '../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, prefix]: [ResourceProxy, string]): Promise<any>;
}
