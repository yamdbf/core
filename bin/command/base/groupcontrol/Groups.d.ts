import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { ResourceLoader } from '../../../types/ResourceLoader';
export default class  extends Command {
    constructor();
    action(message: Message, [res, action, group]: [ResourceLoader, string, string]): Promise<any>;
    /**
     * List command groups
     */
    private listGroups(message, res);
    /**
     * Enable a command group
     */
    private enableGroup(message, res, group);
    /**
     * Disable a command group
     */
    private disableGroup(message, res, group);
}
