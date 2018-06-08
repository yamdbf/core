import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { ResourceProxy } from '../../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, clearOrCommand, rolesOrCommand]: [ResourceProxy, Command | string, Command | string]): Promise<any>;
    /**
     * Clear all roles limiting the given command
     */
    clearLimit(message: Message, res: ResourceProxy, command: Command): Promise<any>;
    /**
     * Add the given roles to the limiter for the given command
     */
    limitCommand(message: Message, res: ResourceProxy, command: Command, roles: string): Promise<any>;
}
