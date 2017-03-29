import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { StorageProvider } from './StorageProvider';
import { Util } from '../Util';

/**
 * Simple key/value storage abstraction operating on top of the
 * given StorageProvider. Supports nested object paths in
 * get/set/remove using `.` like normal object accessors
 */
export class KeyedStorage
{
	private _storage: StorageProvider;
	public constructor(name: string, provider: StorageProviderConstructor)
	{
		this._storage = new provider(name);
	}

	public async init(): Promise<void>
	{
		await this._storage.init();
	}

	public async keys(): Promise<string[]>
	{
		return await this._storage.keys();
	}

	public async get(key: string): Promise<any>
	{
		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			let stringData: string = await this._storage.get(path.shift());
			if (typeof stringData === 'undefined') return;
			let data: object = JSON.parse(stringData);
			return Util.nestedValue(data, path);
		}
		else
		{
			let stringData: string = await this._storage.get(key);
			if (typeof stringData === 'undefined') return;
			return JSON.parse(stringData);
		}
	}

	public async set(key: string, value: any): Promise<void>
	{
		try { JSON.stringify(value); }
		catch (err) { value = {}; }

		let data: any;
		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			let first: string = path.shift();
			data = await this.get(first);
			if (typeof data === 'undefined')
				data = {};
			Util.assignNested(data, path, value);
			key = first;
		}
		else
		{
			data = value;
		}
		await this._storage.set(key, JSON.stringify(data));
	}

	public async remove(key: string): Promise<void>
	{
		if (typeof key === 'undefined') throw new Error('Key must be provided');
		if (typeof key !== 'string') throw new Error('Key must be a string');

		let data: any;
		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			let first: string = path.shift();
			data = await this.get(first);
			if (typeof data !== 'undefined')
				Util.removeNested(data, path);

			key = first;
			await this._storage.set(key, JSON.stringify(data));
		}
		else
		{
			await this._storage.remove(key);
		}
	}

	public async clear(): Promise<void>
	{
		await this._storage.clear();
	}
}
