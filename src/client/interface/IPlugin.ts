/**
 * Interface for plugins to implement, providing compile-time
 * errors for incorrect implementations alongside the abstract
 * `Plugin` class to extend which provides runtime errors for
 * missing method implementations
 *
 * >**Note:** This is a TypeScript feature and you do not need to worry about this bit so much
 * if you are using JavaScript, but the interface members present here must be present on
 * custom plugins at runtime for them to be valid
 * @interface IPlugin
 */
/**
 * The name of the Plugin. This will be used as the property name
 * to access the Plugin instance itself at runtime if desired via
 * `<Client>.plugins.loaded..<name>`
 * @name IPlugin#name
 * @type {string}
 */
/**
 * Method that will be called by the Plugin loader when the
 * Plugin is loaded. This is the only method that will be called by
 * the framework automatically, so this should be where anything
 * necessary should be done to make the Plugin operational.
 *
 * > This method can be async if desired or needed
 * @method IPlugin#init
 * @returns {Promise<void>|void}
 */

export interface IPlugin
{
	name: string;
	init(): Promise<void> | void;
}
