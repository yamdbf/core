import { MiddlewareFunction } from '../../types/MiddlewareFunction';
export declare type MappedArgType = {
    [arg: string]: string | string[];
};
export declare function resolve(argTypes: string | MappedArgType): MiddlewareFunction;
