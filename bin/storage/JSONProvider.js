"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StorageProvider_1 = require("./StorageProvider");
const DB = require("node-json-db");
class JSONProvider extends StorageProvider_1.StorageProvider {
    constructor(name) {
        super();
        this._name = name;
    }
    async init() {
        this._db = new DB(`storage/${this._name}`, true, true);
    }
    async keys() {
        try {
            let data = this._db.getData('/');
            return Object.keys(data);
        }
        catch (_a) {
            return [];
        }
    }
    async get(key) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        try {
            let data = this._db.getData(`/${key}`);
            return data;
        }
        catch (_a) {
            return undefined;
        }
    }
    async set(key, value) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        if (typeof value === 'undefined')
            throw new TypeError('Value must be provided');
        if (typeof value !== 'string')
            throw new TypeError('Value must be a string');
        this._db.push(`/${key}`, value, true);
    }
    async remove(key) {
        if (typeof key === 'undefined')
            throw new TypeError('Key must be provided');
        if (typeof key !== 'string')
            throw new TypeError('Key must be a string');
        try {
            this._db.delete(`/${key}`);
        }
        catch (_a) {
            return;
        }
    }
    async clear() {
        try {
            for (const key of await this.keys())
                this._db.delete(`/${key}`);
        }
        catch (_a) {
            return;
        }
    }
}
exports.JSONProvider = JSONProvider;

//# sourceMappingURL=JSONProvider.js.map
