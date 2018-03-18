import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceProxy } from '../../types/ResourceProxy';
export default class  extends Command {
    constructor();
    action(message: Message, [res, action, name, content]: [ResourceProxy, string, string, string]): Promise<any>;
    /**
     * List command shortcuts
     */
    private listShortcuts(message, res);
    /**
     * Set command shortcut content
     */
    private setShortcut(message, res, name, content);
    /**
     * Get command shortcut content
     */
    private getShortcut(message, res, name);
    /**
     * Remove a command shortcut
     */
    private removeShortcut(message, res, name);
}
