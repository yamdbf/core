import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
export declare class CommandResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): boolean;
    resolveRaw(value: string): Command | undefined;
    resolve(message: Message, command: Command, name: string, value: string): Promise<Command>;
}
