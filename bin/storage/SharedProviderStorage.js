"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../util/Util");
const Logger_1 = require("../util/logger/Logger");
/**
 * Simple async key/value storage abstraction operating on top
 * of a single key within the given StorageProvider instance.
 * As the name suggests, the given StorageProvider instance
 * can be shared between multiple SharedProviderStorage instances
 *
 * >Supports nested object paths in get/set/remove using `.`
 * like normal object accessors
 *
 * >**Note:** The storage provider given to the constructor should
 * already be initialized via its `init()` method
 */
class SharedProviderStorage {
    constructor(storage, key) {
        this._provider = storage;
        this._key = key;
        this._cache = {};
    }
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    async init() {
        try {
            let data = await this._provider.get(this._key);
            if (typeof data === 'undefined') {
                data = {};
                await this._provider.set(this._key, JSON.stringify(data));
            }
            else
                data = JSON.parse(data);
            this._cache = data;
        }
        catch (err) {
            Logger_1.Logger.instance().error('SharedProviderStorage', err.stack);
        }
    }
    /**
     * Get the names of all keys in this storage for this instance
     * @returns {Promise<string[]>}
     */
    async keys() {
        return Object.keys(this._cache);
    }
    /**
     * Get a value from storage for this instance
     * @param {string} key The key in storage to get
     * @returns {Promise<any>}
     */
    async get(key) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        if (key.includes('.')) {
            let path = key.split('.');
            return Util_1.Util.getNestedValue(this._cache[path.shift()], path);
        }
        else
            return this._cache[key];
    }
    /**
     * Check if a value exists in storage for this instance
     * @param {string} key The key in storage to check
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        return typeof await this.get(key) !== 'undefined';
    }
    /**
     * Set a value in storage for this instance
     * @param {string} key The key in storage to set
     * @param {any} value The value to set
     * @returns {Promise<void>}
     */
    async set(key, value) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        if (typeof value === 'undefined')
            throw new TypeError('Value must be provided');
        try {
            JSON.stringify(value);
        }
        catch (_a) {
            value = {};
        }
        if (key.includes('.')) {
            let path = key.split('.');
            key = path.shift();
            if (typeof this._cache[key] === 'undefined')
                this._cache[key] = {};
            Util_1.Util.assignNestedValue(this._cache[key], path, value);
        }
        else
            this._cache[key] = value;
        await this._provider.set(this._key, JSON.stringify(this._cache));
    }
    /**
     * Remove a value from storage for this instance
     * @param {string} key The key in storage to remove
     * @returns {Promise<void>}
     */
    async remove(key) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        if (key.includes('.')) {
            let path = key.split('.');
            key = path.shift();
            if (typeof this._cache[key] !== 'undefined')
                Util_1.Util.removeNestedValue(this._cache[key], path);
        }
        else
            delete this._cache[key];
        await this._provider.set(this._key, JSON.stringify(this._cache));
    }
    /**
     * Remove all key/value pairs from storage for this instance
     * @returns {Promise<void>}
     */
    async clear() {
        this._cache = {};
        await this._provider.set(this._key, JSON.stringify(this._cache));
    }
}
exports.SharedProviderStorage = SharedProviderStorage;

//# sourceMappingURL=SharedProviderStorage.js.map
