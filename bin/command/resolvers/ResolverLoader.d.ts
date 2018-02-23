import { Resolver } from './Resolver';
import { Client } from '../../client/Client';
/**
 * Loads and stores Command argument {@link Resolver}s
 */
export declare class ResolverLoader {
    private readonly _client;
    private readonly _base;
    loaded: {
        [name: string]: Resolver;
    };
    constructor(client: Client);
    /**
     * Get a loaded Resolver by name or alias
     * @param {string} name Identifier of the Resolver to get
     * @returns {Resolver}
     */
    get(name: string): Resolver;
    /**
     * Load resolvers from _base and client._customResolvers.
     * Used internally
     * @private
     */
    _loadResolvers(): void;
}
