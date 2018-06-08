import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { ResourceProxy } from '../../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, action, group]: [ResourceProxy, string, string]): Promise<any>;
    /**
     * List command groups
     */
    private listGroups;
    /**
     * Enable a command group
     */
    private enableGroup;
    /**
     * Disable a command group
     */
    private disableGroup;
}
