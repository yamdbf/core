import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { IStorageProvider } from './interface/IStorageProvider';
import { StorageProvider } from './StorageProvider';
import { Database } from './Database';
import { Util } from '../util/Util';
import * as Sequelize from 'sequelize';

/**
 * Represents a Sequelize Model instance which represents a single
 * db table entry from the table controlled by the `SequelizeProvider`.
 */
interface StorageEntry extends Sequelize.Model
{
	key: string;
	value: string;
}

/**
 * Represents a Model cast type that fixes some issues with Model
 * methods that have `this` types declared
 */
type SequelizeModel = (new () => Sequelize.Model) & typeof Sequelize.Model;

export enum Dialect { Postgres, SQLite, MSSQL, MySQL }

export function SequelizeProvider(url: string, dialect: Dialect, debug: boolean): StorageProviderConstructor
{
	return class extends StorageProvider implements IStorageProvider
	{
		private readonly _backend: Database;
		private readonly _model: SequelizeModel;

		public constructor(name: string)
		{
			super();

			// Lazy load sequelize
			const packages: string[] = ['sequelize-typescript', 'sequelize'];
			const seq: typeof Sequelize = Util.lazyLoad<typeof Sequelize>(...packages);

			this._backend = Database.instance(url, debug);
			this._model = class extends seq.Model {};

			const dataTypes: typeof Sequelize.DataTypes =
				(seq as any)['DataTypes']
					? (seq as any)['DataTypes']
					: (seq as any)['DataType'];

			this._model.init(
				{
					key: { type: dataTypes.STRING, allowNull: false, primaryKey: true },
					value: [Dialect.Postgres, Dialect.SQLite, Dialect.MSSQL].includes(dialect)
						? dataTypes.TEXT
						: dataTypes.TEXT('long')
				},
				{
					modelName: name,
					timestamps: false,
					freezeTableName: true,
					sequelize: this._backend.db
				}
			);
		}

		public async init(): Promise<void>
		{
			await this._backend.init();
			await this._backend.db.sync();
		}

		public async keys(): Promise<string[]>
		{
			return (await this._model.findAll() as StorageEntry[]).map(r => r.key);
		}

		public async get(key: string): Promise<string | undefined>
		{
			if (typeof key === 'undefined') throw new TypeError('Key must be provided');
			if (typeof key !== 'string') throw new TypeError('Key must be a string');

			const entry: StorageEntry = await this._model.findByPk(key) as StorageEntry;
			if (entry === null) return;

			return entry.value;
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
