export declare function deprecatedClass(message: string): ClassDecorator;
export declare function deprecatedClass<T extends new (...args: any[]) => any>(target: T): T;
