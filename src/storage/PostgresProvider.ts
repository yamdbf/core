import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { IStorageProvider } from './interface/IStorageProvider';
import { StorageProvider } from './StorageProvider';
import * as Sequelize from 'sequelize';

/**
 * Represents an entry in a PostgresProvider db table
 * following the Model the provider uses
 */
type Entry = { key: string, value: string };

/**
 * Represents a Model entry returned from `<Sequelize>.findByPrimary()`.
 * Guaranteed to return a string in this representation because a
 * `StorageProvider` is guaranteed to only store, and thus retrieve, strings
 */
type ReturnedModel = { get(key: string): string };

export function PostgresProvider(url: string): StorageProviderConstructor
{
	return class extends StorageProvider implements IStorageProvider
	{
		private _name: string;
		private _url: string;
		private _db: Sequelize.Sequelize;
		private _model: Sequelize.Model<object, object>;
		public constructor(name: string)
		{
			super();
			this._name = name;
			this._url = url;

			this._db = new Sequelize(this._url,
				{ logging: false, define: { timestamps: false, freezeTableName: true } });

			this._model = this._db.define(name, {
				key: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
				value: Sequelize.TEXT
			});
		}

		public async init(): Promise<void>
		{
			try { await this._db.authenticate(); }
			catch (err)
			{
				console.error(new Error(`Failed to connect to the Postgres database:\n${err}`));
				process.exit();
			}
			await this._db.sync();
		}

		public async keys(): Promise<string[]>
		{
			const keys: string[] = (<Entry[]> await this._model.findAll()).map(r => r.key);
			return keys;
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
			await this._model.destroy({ where: { key }});
		}

		public async clear(): Promise<void>
		{
			await this._model.destroy({ where: {} });
		}
	};
}
