import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceLoader } from '../../types/ResourceLoader';
export default class  extends Command {
    constructor();
    action(message: Message, [res, lang]: [ResourceLoader, number]): Promise<any>;
}
