"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const Command_1 = require("../command/Command");
const Logger_1 = require("../util/logger/Logger");
const LangFileParser_1 = require("./LangFileParser");
const Util_1 = require("../util/Util");
const DeprecatedMethodDecorator_1 = require("../util/DeprecatedMethodDecorator");
/**
 * Module providing localization support throughout the framework.
 * Allows client output to be translated to other languages
 * @module Lang
 */
class Lang {
    constructor(client) {
        if (Lang._instance)
            throw new Error('Cannot create multiple instances of Lang singleton');
        this._client = client;
        this._commandInfo = {};
        this._groupInfo = {};
        this._langs = {};
        this._meta = {};
    }
    /**
     * Contains all loaded languages and their strings.
     * This does not include localized command helptext.
     * Rather than using this directly, loading stings with
     * a {@link ResourceLoader} function is preferred
     * @static
     * @name langs
     * @type {object}
     */
    static get langs() {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        return Lang._instance._langs;
    }
    /**
     * Contains all available localization languages
     * @static
     * @name langNames
     * @type {string[]}
     */
    static get langNames() {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        let langs = new Set();
        for (const commandName of Object.keys(Lang._instance._commandInfo))
            for (const lang of Object.keys(Lang._instance._commandInfo[commandName]))
                langs.add(lang);
        for (const lang of Object.keys(Lang.langs))
            langs.add(lang);
        return Array.from(langs);
    }
    /**
     * Create the singleton instance.
     * Called automatically by the YAMDBF Client at startup
     * @static
     * @method createInstance
     * @param {Client} client YAMDBF Client instance
     * @returns {void}
     */
    static createInstance(client) {
        if (!Lang._instance)
            Lang._instance = new Lang(client);
    }
    /**
     * Set a metadata key/value for a given language
     * @static
     * @method setMetaValue
     * @param {string} lang Language to set metadata for
     * @param {string} key Metadata key to set
     * @param {any} value Metadata value to assign
     * @returns {void}
     */
    static setMetaValue(lang, key, value) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        Util_1.Util.assignNestedValue(Lang._instance._meta, [lang, key], value);
    }
    /**
     * Get a metadata value by key for a given language
     * @static
     * @method getMetaValue
     * @param {string} lang Language to get metadata for
     * @param {string} key Metadata key to get
     * @returns {any}
     */
    static getMetaValue(lang, key) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        return Util_1.Util.getNestedValue(Lang._instance._meta, [lang, key]);
    }
    /**
     * Get all metadata for a given language
     * @static
     * @method getMetadata
     * @param {string} lang Language to get metadata for
     * @returns {object}
     */
    static getMetadata(lang) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        return Lang._instance._meta[lang] || {};
    }
    /**
     * Set the language to try when a string cannot be found for
     * the current language
     * @static
     * @method setFallbackLang
     * @param {string} lang Fallback language to set
     * @returns {void}
     */
    static setFallbackLang(lang) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        Lang._instance._fallbackLang = lang;
    }
    /**
     * To be run after loading any localizations
     * @private
     */
    static postLoad() {
        if (Lang.langNames.length > 1
            && (!Lang._instance._client.disableBase.includes('setlang')
                && Lang._instance._client.commands.has('setlang')
                && Lang._instance._client.commands.get('setlang').disabled)) {
            Lang._instance._client.commands.get('setlang').enable();
            Lang._logger.info(`Additional langugage loaded, enabled 'setlang' command.`);
        }
    }
    /**
     * Load all localization files (`*.lang`) from the given directory.
     * This can be used to manually load custom localizations
     * from any given directory (when writing plugins, for instance)
     * @static
     * @method loadLocalizationsFrom
     * @param {string} dir Directory to load from
     * @returns {void}
     */
    static loadLocalizationsFrom(dir) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        const langNameRegex = /\/([^\/\.]+)(?:\.[^\/]+)?\.lang$/;
        let langs = {};
        let files = [];
        dir = path.resolve(dir);
        files.push(...glob.sync(`${dir}/**/*.lang`));
        if (files.length === 0)
            throw new Error(`Failed to find any localization files in: ${dir}`);
        for (const file of files) {
            if (!langNameRegex.test(file))
                continue;
            const name = file.match(langNameRegex)[1];
            if (!langs[name])
                langs[name] = [];
            langs[name].push(file);
        }
        for (const lang in langs) {
            for (const file of langs[lang]) {
                if (!langNameRegex.test(file))
                    continue;
                const contents = fs
                    .readFileSync(file)
                    .toString()
                    .replace(/\r\n/g, '\n');
                const parsedLanguageFile = LangFileParser_1.LangFileParser.parseFile(lang, file, contents);
                if (typeof Lang._instance._langs[lang] !== 'undefined')
                    Lang._instance._langs[lang].concat(parsedLanguageFile);
                else
                    Lang._instance._langs[lang] = parsedLanguageFile;
            }
        }
        Lang.postLoad();
    }
    /**
     * Load base localization files and load localization files
     * from the Client's `localeDir`. Called automatically by
     * the YAMDBF Client at startup
     * @static
     * @method loadLocalizations
     * @returns {void}
     */
    static loadLocalizations() {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        Lang.setMetaValue('en_us', 'name', 'English');
        Lang.loadLocalizationsFrom(path.join(__dirname, './en_us'));
        if (Lang._instance._client.localeDir)
            Lang.loadLocalizationsFrom(Lang._instance._client.localeDir);
        Lang._logger.info(`Loaded string localizations for ${Object.keys(Lang.langs).length} languages.`);
    }
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
    static loadCommandLocalizationsFrom(dir) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        let files = [];
        dir = path.resolve(dir);
        files.push(...glob.sync(`${dir}/**/*.lang.json`));
        if (files.length === 0)
            return;
        for (const file of files) {
            // Ignore reserved commandgroups.lang.json
            if (/commandgroups\.lang\.json$/.test(file))
                continue;
            let localizations;
            try {
                localizations = require(file);
            }
            catch (_a) {
                continue;
            }
            for (const command of Object.keys(localizations))
                for (const lang of Object.keys(localizations[command])) {
                    if (typeof Util_1.Util.getNestedValue(Lang._instance._commandInfo, [command, lang]) === 'undefined')
                        Util_1.Util.assignNestedValue(Lang._instance._commandInfo, [command, lang], {});
                    Lang._instance._commandInfo[command][lang] = Object.assign({}, Lang._instance._commandInfo[command][lang], localizations[command][lang]);
                }
        }
        Lang.postLoad();
    }
    /**
     * Find and load `commandgroups.lang.json` from the provided directory,
     * setting command group descriptions for the given groups and languages
     * in the file
     * @static
     * @method loadGroupLocalizationsFrom
     * @param {string} dir Directory to load from
     * @returns {void}
     */
    static loadGroupLocalizationsFrom(dir) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        dir = path.resolve(dir);
        const file = glob.sync(`${dir}/**/commandgroups.lang.json`)[0];
        if (!file)
            return;
        let groupInfo;
        try {
            groupInfo = require(file);
        }
        catch (err) {
            throw new Error(`Failed to load group localizations from '${file}:\n${err.stack}`);
        }
        for (const group of Object.keys(groupInfo))
            for (const lang of Object.keys(groupInfo[group]))
                Util_1.Util.assignNestedValue(Lang._instance._groupInfo, [group, lang], groupInfo[group][lang]);
    }
    /**
     * Load any command info and command group localizations
     * from the Client's `commandsDir`. Called automatically
     * by the YAMDBF Client at startup
     * @static
     * @method loadCommandLocalizations
     * @returns {void}
     */
    static loadCommandLocalizations() {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        Lang.loadGroupLocalizationsFrom(path.join(__dirname, './en_us'));
        if (!Lang._instance._client.commandsDir)
            return;
        Lang.loadCommandLocalizationsFrom(Lang._instance._client.commandsDir);
        Lang.loadGroupLocalizationsFrom(Lang._instance._client.commandsDir);
        const helpTextLangs = new Set();
        for (const command of Object.keys(Lang._instance._commandInfo))
            for (const lang of Object.keys(Lang._instance._commandInfo[command]))
                helpTextLangs.add(lang);
        Lang._logger.info(`Loaded helptext localizations for ${helpTextLangs.size} languages.`);
    }
    /**
     * Get localized Command info, defaulting to the info
     * given in the Command's constructor
     * @static
     * @method getCommandInfo
     * @param {Command} command Command to get localized info for
     * @param {string} lang Language to get the localized info in
     * @returns {LocalizedCommandInfo}
     */
    static getCommandInfo(command, lang) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        if (!command)
            throw new Error('A Command must be given for which to get Command info');
        if (!(command instanceof Command_1.Command))
            throw new TypeError('command must be an instance of Command class');
        const paths = [command.name, lang];
        let desc, info, usage;
        desc = Util_1.Util.getNestedValue(Lang._instance._commandInfo, [...paths, 'desc']) || command.desc || '';
        info = Util_1.Util.getNestedValue(Lang._instance._commandInfo, [...paths, 'info']) || command.info || '';
        usage = Util_1.Util.getNestedValue(Lang._instance._commandInfo, [...paths, 'usage']) || command.usage || '';
        return { desc, info, usage };
    }
    /**
     * Get the localized Command group description for the
     * given group and language
     * @param {string} group Command group to get localized info for
     * @param {string} lang Language to get localized group info in
     */
    static getGroupInfo(group, lang) {
        if (!Lang._instance)
            throw new Error('Lang singleton instance has not been created');
        if (!group)
            throw new Error('A group must be provided');
        return Util_1.Util.getNestedValue(Lang._instance._groupInfo, [group, lang]) || `${lang}::group_${group}`;
    }
    /**
     * Gets the language that should be used for localization via the given {@link Message}
     * based on whether the Message is a DM, the Guild's configured language,
     * and the Client's default language
     * @static
     * @method getLangFromMessage
     * @param {Message} message
     * @returns {Promise<string>}
     */
    static async getLangFromMessage(message) {
        const dm = message.channel.type !== 'text';
        const storage = !dm
            ? Lang._instance._client.storage.guilds.get(message.guild.id)
            : null;
        const lang = dm
            ? Lang._instance._client.defaultLang
            : (storage && await storage.settings.get('lang'))
                || Lang._instance._client.defaultLang;
        return lang;
    }
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
    static res(lang, key, data = {}) {
        if (!Lang.langs[lang]
            && Lang._instance._fallbackLang
            && Lang.langs[Lang._instance._fallbackLang])
            return `${lang}::${key}`;
        let node = Lang.langs[lang].strings[key];
        // Try loading string via the fallback language if it's set
        // and the given string can't be found for the given language
        if (!node) {
            if (Lang._instance._fallbackLang
                && Lang.langs[Lang._instance._fallbackLang])
                node = Lang.langs[Lang._instance._fallbackLang].strings[key];
            if (!node)
                return `${lang}::${key}`;
        }
        let loadedString = node.value;
        // Run the argsValidator for the node if it exists
        if (typeof node.argsValidator !== 'undefined')
            node.argsValidator(data);
        // Don't bother running scripts and stuff if no args are passed.
        // Clean out maybe templates, replace escaped new lines with real
        // ones and return the loaded string
        if (typeof data === 'undefined')
            return loadedString
                .replace(Lang._maybeTemplates, '')
                .replace(/\\n/g, '\n');
        // Handle templates
        for (const template of Object.keys(data)) {
            // Skip maybe templates so they can be removed properly later
            if (new RegExp(`{{ *${template} *\\?}}`, 'g').test(loadedString)
                && (data[template] === '' || data[template] === undefined))
                continue;
            loadedString = loadedString.replace(new RegExp(`{{ *${template} *\\??}}`, 'g'), () => data[template]);
        }
        // Run embedded Lang string node scripts if any
        if (node.scripts.length > 0) {
            const proxy = Lang.createResourceProxy(lang);
            const dataForwardProxy = new Proxy({}, {
                get: (_, prop) => {
                    return (args = data) => proxy[prop](args);
                }
            });
            for (const script in node.scripts) {
                const loadedScript = node.scripts[script];
                let result;
                try {
                    result = loadedScript.func(data, dataForwardProxy);
                }
                catch (err) {
                    throw new Error(`in embedded localization script for: ${lang}::${key}\n${err}`);
                }
                // Try coerced implicit return if it exists
                if (typeof result === 'undefined'
                    && loadedScript.implicitReturnFunc)
                    result = loadedScript.implicitReturnFunc(data, dataForwardProxy);
                // If the script occupies its own line, follow script result with a line break
                if ((new RegExp(`^{{! ${script} !}}[\\t ]*\\n`)).test(loadedScript.raw) && result !== '')
                    loadedString = loadedString.replace(`{{! ${script} !}}`, () => `${result}\n`);
                else
                    loadedString = loadedString.replace(`{{! ${script} !}}`, () => result);
            }
        }
        return loadedString
            .replace(Lang._maybeTemplates, '')
            .replace(/\\n/g, '\n');
    }
    /**
     * Takes a language string and returns a function that loads string
     * resources for that specific language
     * @deprecated Use {@link module:Lang.createResourceProxy} instead
     * @static
     * @method createResourceLoader
     * @param {string} lang The language to create a loader for
     * @returns {ResourceLoader}
     */
    static createResourceLoader(lang) {
        return (key, data) => Lang.res(lang, key, data);
    }
    /**
     * Creates a ResourceProxy, where keys are ResourceLoader functions
     * that only need the TemplateData
     * @static
     * @method createResourceProxy
     * @param {string} Lang The language to create a ResourceProxy for
     * @returns {ResourceProxy}
     */
    static createResourceProxy(lang) {
        return new Proxy({}, {
            get: (_, key) => {
                return (data) => Lang.res(lang, key, data);
            }
        });
    }
}
Lang._maybeTemplates = /^{{ *[a-zA-Z]+ *\?}}[\t ]*\n|{{ *[a-zA-Z]+ *\?}}/gm;
__decorate([
    Logger_1.logger('Lang')
], Lang, "_logger", void 0);
__decorate([
    DeprecatedMethodDecorator_1.deprecatedMethod('`Lang.createResourceLoader()` is deprecated. Use `Lang.createResourceProxy()` instead')
], Lang, "createResourceLoader", null);
exports.Lang = Lang;

//# sourceMappingURL=Lang.js.map
