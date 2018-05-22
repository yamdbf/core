import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
export declare class BooleanResolver extends Resolver {
    private readonly truthy;
    private readonly falsey;
    constructor(client: Client);
    validate(value: any): boolean;
    resolveRaw(value: string): boolean | undefined;
    resolve(message: Message, command: Command, name: string, value: string): Promise<boolean>;
}
