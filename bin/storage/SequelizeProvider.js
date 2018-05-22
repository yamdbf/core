"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StorageProvider_1 = require("./StorageProvider");
const Database_1 = require("./Database");
var Dialect;
(function (Dialect) {
    Dialect[Dialect["Postgres"] = 0] = "Postgres";
    Dialect[Dialect["SQLite"] = 1] = "SQLite";
    Dialect[Dialect["MSSQL"] = 2] = "MSSQL";
    Dialect[Dialect["MySQL"] = 3] = "MySQL";
})(Dialect = exports.Dialect || (exports.Dialect = {}));
function SequelizeProvider(url, dialect, debug) {
    return class extends StorageProvider_1.StorageProvider {
        constructor(name) {
            super();
            // Lazy load sequelize
            const seq = require('sequelize');
            this._backend = Database_1.Database.instance(url, debug);
            this._model = this._backend.db.define(name, {
                key: { type: seq.STRING, allowNull: false, primaryKey: true },
                value: [Dialect.Postgres, Dialect.SQLite, Dialect.MSSQL].includes(dialect) ?
                    seq.TEXT : seq.TEXT('long')
            }, { timestamps: false, freezeTableName: true });
        }
        async init() {
            await this._backend.init();
            await this._backend.db.sync();
        }
        async keys() {
            return (await this._model.findAll()).map(r => r.key);
        }
        async get(key) {
            if (typeof key === 'undefined')
                throw new TypeError('Key must be provided');
            if (typeof key !== 'string')
                throw new TypeError('Key must be a string');
            const entry = await this._model.findByPrimary(key);
            if (entry === null)
                return;
            return entry.get('value');
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
            await this._model.upsert({ key, value });
        }
        async remove(key) {
            if (typeof key === 'undefined')
                throw new TypeError('Key must be provided');
            if (typeof key !== 'string')
                throw new TypeError('Key must be a string');
            await this._model.destroy({ where: { key } });
        }
        async clear() {
            await this._model.destroy({ where: {} });
        }
    };
}
exports.SequelizeProvider = SequelizeProvider;

//# sourceMappingURL=SequelizeProvider.js.map
