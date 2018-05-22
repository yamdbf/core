"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Method to implement that should return whether or not the
 * given value matches the type the resolver is meant to resolve.
 * >Can be async
 * @abstract
 * @method Resolver#validate
 * @param {any} value Value to validate
 * @returns {Promise<boolean>}
 */
/**
 * Method to implement that should accept a string and return
 * a resolved value of the type the resolver is meant to resolve.
 *
 * This method can and should throw errors when invalid input is given.
 * These errors will be sent to Discord as argument errors when using
 * the `resolve` middleware. Refer to the base Resolver error strings
 * for examples on what these errors should look like if you're trying
 * to keep things in-line with YAMDBF
 *
 * >Can be async
 * @abstract
 * @method Resolver#resolve
 * @param {Message} message Discord.js Message instance
 * @param {Command} command Instance of the Command being called
 * @param {string} name Argument name
 * @param {string} value Argument value
 * @returns {Promise<any>}
 */
/**
 * Resolver class to extend for creating Command argument resolvers.
 * Custom Resolvers must implement the `validate()` and `resolve()` methods
 * @param {Client} client YAMDBF Client instance
 * @param {string} name Resolver type name. This is the type name used
 * 						when specifying types in [resolve]{@link module:Middleware.resolve}
 * 						and [expect]{@link module:Middleware.expect}<br>
 * 						**Note:** This is not passed by the ResolverLoader, so
 * 						pass it to `super()` yourself when creating custom Resolvers
 * @param {...string} aliases Alternative names the Resolver can be identified by
 */
class Resolver {
    constructor(client, name, ...aliases) {
        this.client = client;
        /**
         * Name that servers as an identifier for the resolver
         * @type {string}
         */
        this.name = name;
        /**
         * Additional identifier strings
         * @type {string[]}
         */
        this.aliases = aliases;
    }
    /**
     * Method recommended to be implemented for resolving data without side-effects.
     * Where `resolve()` should throw errors which will be sent to Discord when
     * a value cannot be resolved, this method should simply return `undefined`.
     *
     * All base resolvers will implement this method with this signature so that
     * they can be accessed for personal use via `<Client>.resolvers.get('resolver
     * name or alias')`.
     *
     * Some resolvers require additional context in the form of a partial {@link Message}
     * object in order to be able to resolve their data type from the given input
     * (like needing a guild from the message to be able to resolve a `GuildMember`
     * via the `Member` resolver). It's safest to assume that all base resolvers will
     * want this context reference as only a small handful do not (specifically String,
     * Number, Duration, Command, and CommandGroup). In the case of your own custom
     * resolvers, you should know what needs context and what doesn't, so you can get
     * away with passing as needed there.
     *
     * In cases where a full Message object is unavailable but context is known,
     * if you have a Guild instance, for example, you can simply pass it like
     * ```
     * let resolved = <Resolver>.resolveRaw(value, { guild });
     * ```
     * This is fine for all base resolvers, as the most any of them expect from
     * the context is for it to contain a `guild` field with a Guild instance,
     * and they will throw an error if the context they require is missing.
     *
     * >Can be async
     * @abstract
     * @param {string} value String value to resolve data from
     * @param {Partial<Message>} [context] Partial Discord.js Message object
     * @returns {Promise<any>}
     */
    // @ts-ignore - Abstract but optional
    resolveRaw(value, context) { }
}
exports.Resolver = Resolver;

//# sourceMappingURL=Resolver.js.map
