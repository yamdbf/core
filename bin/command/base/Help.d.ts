import { ResourceLoader } from '../../types/ResourceLoader';
import { Message } from '../../types/Message';
import { Command } from '../Command';
export default class  extends Command {
    constructor();
    action(message: Message, [res, commandName]: [ResourceLoader, string]): Promise<void>;
}
