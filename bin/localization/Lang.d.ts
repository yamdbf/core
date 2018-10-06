import { Client } from '../client/Client';
import { Command } from '../command/Command';
import { LocalizedCommandInfo } from '../types/LocalizedCommandInfo';
import { ResourceLoader } from '../types/ResourceLoader';
import { ResourceProxy } from '../types/ResourceProxy';
import { TemplateData } from '../types/TemplateData';
import { Language } from './Language';
import { Message } from '../types/Message';
/**
 * Module providing localization support throughout the framework.
 * Allows client output to be translated to other languages
 * @module Lang
 */
export declare class Lang {
    private static readonly _logger;
    private readonly _client;
    private readonly _commandInfo;
    private readonly _groupInfo;
    private readonly _langs;
    private readonly _meta;
    private _fallbackLang;
    private static _instance;
    private static _maybeTemplates;
    private constructor();
    /**
     * Contains all loaded languages and their strings.
     * This does not include localized command helptext.
     * Rather than using this directly, loading stings with
     * a {@link ResourceLoader} function is preferred
     * @static
     * @name langs
     * @type {object}
     */
    static readonly langs: {
        [lang: string]: Language;
    };
    /**
     * Contains all available localization languages
     * @static
     * @name langNames
     * @type {string[]}
     */
    static readonly langNames: string[];
    /**
     * Create the singleton instance.
     * Called automatically by the YAMDBF Client at startup
     * @static
     * @method createInstance
     * @param {Client} client YAMDBF Client instance
     * @returns {void}
     */
    static createInstance(client: Client): void;
    /**
     * Set a metadata key/value for a given language
     * @static
     * @method setMetaValue
     * @param {string} lang Language to set metadata for
     * @param {string} key Metadata key to set
     * @param {any} value Metadata value to assign
     * @returns {void}
     */
    static setMetaValue(lang: string, key: string, value: any): void;
    /**
     * Get a metadata value by key for a given language
     * @static
     * @method getMetaValue
     * @param {string} lang Language to get metadata for
     * @param {string} key Metadata key to get
     * @returns {any}
     */
    static getMetaValue(lang: string, key: string): any;
    /**
     * Get all metadata for a given language
     * @static
     * @method getMetadata
     * @param {string} lang Language to get metadata for
     * @returns {object}
     */
    static getMetadata(lang: string): {
        [key: string]: any;
    };
    /**
     * Set the language to try when a string cannot be found for
     * the current language
     * @static
     * @method setFallbackLang
     * @param {string} lang Fallback language to set
     * @returns {void}
     */
    static setFallbackLang(lang: string): void;
    /**
     * To be run after loading any localizations
     * @private
     */
    private static postLoad;
    /**
     * Load all localization files (`*.lang`) from the given directory.
     * This can be used to manually load custom localizations
     * from any given directory (when writing plugins, for instance)
     * @static
     * @method loadLocalizationsFrom
     * @param {string} dir Directory to load from
     * @returns {void}
     */
    static loadLocalizationsFrom(dir: string): void;
    /**
     * Load base localization files and load localization files
     * from the Client's `localeDir`. Called automatically by
     * the YAMDBF Client at startup
     * @static
     * @method loadLocalizations
     * @returns {void}
     */
    static loadLocalizations(): void;
    /**
     * Load all command helptext localization files (`*.lang.json`)
     * from the given directory. This can be used to manually load
     * custom command helptext localizations from any given
     * directory (when writing plugins, for instance)
     * @static
     * @method loadCommandLocalizationsFrom
     * @param {string} dir Directory to load from
     * @returns {void}
     */
    static loadCommandLocalizationsFrom(dir: string): void;
    /**
     * Find and load `commandgroups.lang.json` from the provided directory,
     * setting command group descriptions for the given groups and languages
     * in the file
     * @static
     * @method loadGroupLocalizationsFrom
     * @param {string} dir Directory to load from
     * @returns {void}
     */
    static loadGroupLocalizationsFrom(dir: string): void;
    /**
     * Load any command info and command group localizations
     * from the Client's `commandsDir`. Called automatically
     * by the YAMDBF Client at startup
     * @static
     * @method loadCommandLocalizations
     * @returns {void}
     */
    static loadCommandLocalizations(): void;
    /**
     * Get localized Command info, defaulting to the info
     * given in the Command's constructor
     * @static
     * @method getCommandInfo
     * @param {Command} command Command to get localized info for
     * @param {string} lang Language to get the localized info in
     * @returns {LocalizedCommandInfo}
     */
    static getCommandInfo(command: Command, lang: string): LocalizedCommandInfo;
    /**
     * Get the localized Command group description for the
     * given group and language
     * @param {string} group Command group to get localized info for
     * @param {string} lang Language to get localized group info in
     */
    static getGroupInfo(group: string, lang: string): string;
    /**
     * Gets the language that should be used for localization via the given {@link Message}
     * based on whether the Message is a DM, the Guild's configured language,
     * and the Client's default language
     * @static
     * @method getLangFromMessage
     * @param {Message} message
     * @returns {Promise<string>}
     */
    static getLangFromMessage(message: Message): Promise<string>;
    /**
     * Get a string resource for the given language, replacing any
     * templates with the given data and evaluating any embedded
     * template scripts
     * @static
     * @method res
     * @param {string} lang Language to get a string resource for
     * @param {string} key String key to get
     * @param {TemplateData} [data] Values to replace in the string
     * @returns {string}
     */
    static res(lang: string, key: string, data?: TemplateData): string;
    /**
     * Takes a language string and returns a function that loads string
     * resources for that specific language
     * @deprecated Use {@link module:Lang.createResourceProxy} instead
     * @static
     * @method createResourceLoader
     * @param {string} lang The language to create a loader for
     * @returns {ResourceLoader}
     */
    static createResourceLoader(lang: string): ResourceLoader;
    /**
     * Creates a ResourceProxy, where keys are ResourceLoader functions
     * that only need the TemplateData
     * @static
     * @method createResourceProxy
     * @param {string} Lang The language to create a ResourceProxy for
     * @returns {ResourceProxy}
     */
    static createResourceProxy<T = {}>(lang: string): ResourceProxy<T>;
}
