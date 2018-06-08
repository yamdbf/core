import { Message } from '../../types/Message';
import { Command } from '../Command';
import { ResourceProxy } from '../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, action, name, content]: [ResourceProxy, string, string, string]): Promise<any>;
    /**
     * List command shortcuts
     */
    private listShortcuts;
    /**
     * Set command shortcut content
     */
    private setShortcut;
    /**
     * Get command shortcut content
     */
    private getShortcut;
    /**
     * Remove a command shortcut
     */
    private removeShortcut;
}
