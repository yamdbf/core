import { ResourceLoader } from '../../../types/ResourceLoader';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
export default class  extends Command {
    constructor();
    action(message: Message, [res, clearOrCommand, rolesOrCommand]: [ResourceLoader, Command | string, Command | string]): Promise<any>;
    /**
     * Clear all roles limiting the given command
     */
    clearLimit(message: Message, res: ResourceLoader, command: Command): Promise<any>;
    /**
     * Add the given roles to the limiter for the given command
     */
    limitCommand(message: Message, res: ResourceLoader, command: Command, roles: string): Promise<any>;
}
