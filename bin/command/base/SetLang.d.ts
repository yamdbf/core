import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceProxy } from '../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, lang]: [ResourceProxy, number]): Promise<any>;
}
