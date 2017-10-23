import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { IStorageProvider } from './interface/IStorageProvider';
import { StorageProvider } from './StorageProvider';
import { Database } from './Database';
import * as Sequelize from 'sequelize';

/**
 * Represents an entry in a `SequelizeProvider` db table
 * following the Model the provider uses
 */
type Entry = { key: string, value: string };

/**
 * Represents a Model entry returned from `<Sequelize>.findByPrimary()`.
 * Guaranteed to return a string in this representation because a
 * `StorageProvider` is guaranteed to only store, and thus retrieve, strings
 */
type ReturnedModel = { get(key: string): string };

export enum Dialect { Postgres, SQLite, MSSQL, MySQL }

export function SequelizeProvider(url: string, dialect: Dialect, debug: boolean): StorageProviderConstructor
{
	return class extends StorageProvider implements IStorageProvider
	{
		private readonly _name: string;
		private readonly _url: string;
		private readonly _backend: Database;
		private readonly _model: Sequelize.Model<object, object>;

		public constructor(name: string)
		{
			super();
			this._name = name;
			this._url = url;

			// Lazy load sequelize
			const seq: typeof Sequelize = require('sequelize');

			this._backend = Database.instance(url, debug);
			this._model = this._backend.db.define(name, {
				key: { type: seq.STRING, allowNull: false, primaryKey: true },
				value: (dialect === Dialect.Postgres || dialect === Dialect.SQLite || dialect === Dialect.MSSQL) ?
					seq.TEXT : seq.TEXT('long') },
				{ timestamps: false, freezeTableName: true });
		}

		public async init(): Promise<void>
		{
			await this._backend.init();
			await this._backend.db.sync();
		}

		public async keys(): Promise<string[]>
		{
			return (<Entry[]> await this._model.findAll()).map(r => r.key);
		}

		public async get(key: string): Promise<string>
		{
			if (typeof key === 'undefined') throw new TypeError('Key must be provided');
			if (typeof key !== 'string') throw new TypeError('Key must be a string');

			const entry: ReturnedModel = <ReturnedModel> await this._model.findByPrimary(key);
			if (entry === null) return;

			return entry.get('value');
		}

		public async set(key: string, value: string): Promise<void>
		{
			if (typeof key === 'undefined') throw new TypeError('Key must be provided');
			if (typeof key !== 'string') throw new TypeError('Key must be a string');
			if (typeof value === 'undefined') throw new TypeError('Value must be provided');
			if (typeof value !== 'string') throw new TypeError('Value must be a string');

			await this._model.upsert({ key, value });
		}

		public async remove(key: string): Promise<void>
		{
			if (typeof key === 'undefined') throw new TypeError('Key must be provided');
			if (typeof key !== 'string') throw new TypeError('Key must be a string');
			await this._model.destroy({ where: { key } });
		}

		public async clear(): Promise<void>
		{
			await this._model.destroy({ where: {} });
		}
	};
}
