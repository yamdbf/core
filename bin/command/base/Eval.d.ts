import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceLoader } from '../../types/ResourceLoader';
export default class  extends Command {
    constructor();
    action(message: Message, [res]: [ResourceLoader]): Promise<any>;
    private _clean(text);
}
