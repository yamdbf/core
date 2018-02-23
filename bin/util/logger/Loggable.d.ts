import { Logger } from './Logger';
export declare type Constructable<T = {}> = new (...args: any[]) => T;
export interface ILoggable {
    logger: Logger;
}
/**
 * Extending this mixin method will give classes a `logger` property
 * containing a reference to the {@link Logger} singleton instance.
 * Accepts a parent class as a parameter when extending another class
 * ```
 * class Foo extends Loggable() {}
 * class Bar extends Loggable(Baz) {}
 * ```
 * Note that this is a mixin function returning a class, not an actual
 * class itself. The method call parentheses are necessary.
 *
 * >**Warning:** While this is fully functional at runtime, due to a TypeScript
 * compiler bug, this will currently throw a compiler error unless you also import
 * `ILoggable`. However, this will error if using the `noUnusedLocals` compiler
 * option, but in my experience does not trigger TSLint's unused import rule.
 * This was labeled as `done` for the TypeScript 2.5 milestone but was removed
 * with no word so I am unsure of the state of this bug going forward. I'm leaving
 * the code in in hopes the bug will be fixed because I really like this method of
 * attaching the Logger. It was my oringial intention when I first wrote the Logger
 * itself but had to settle for alternatives
 * @class Loggable
 * @mixin
 * @property {Logger} logger The Logger instance attached to the Loggable class
 */
export declare function Loggable<T extends Constructable>(Base?: T): Constructable<ILoggable> & T;
