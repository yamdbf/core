import { StorageProvider } from './StorageProvider';
import DB = require('node-json-db');

export class JSONProvider extends StorageProvider
{
	private _name: string;
	private _db: DB;
	public constructor(name: string)
	{
		super();
		this._name = name;
	}

	public async init(): Promise<void>
	{
		this._db = new DB(`storage/${this._name}`);
	}

	public async keys(): Promise<string[]>
	{
		return Object.keys(this._db.getData('/'));
	}

	public async get(key: string): Promise<string>
	{
		return this._db.getData(`/${key}`);
	}

	public async set(key: string, value: string): Promise<void>
	{
		this._db.push(`/${key}`, value);
	}

	public async remove(key: string): Promise<void>
	{
		this._db.delete(`/${key}`);
	}

	public async clear(): Promise<void>
	{
		for (const key of await this.keys()) this._db.delete(`/${key}`);
	}
}
