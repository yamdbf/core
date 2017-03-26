export abstract class StorageProvider
{
	public abstract async init(): Promise<void>;
	public abstract async keys(): Promise<string[]>;
	public abstract async get(key: string): Promise<string>;
	public abstract async set(key: string, value: string): Promise<void>;
	public abstract async remove(key: string): Promise<void>;
	public abstract async clear(): Promise<void>;
}
