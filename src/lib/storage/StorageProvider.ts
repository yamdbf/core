export class StorageProvider
{
	public async init(): Promise<void> { throw new Error('Storage providers must implement the `init` method'); }
	public async keys(): Promise<string[]> { throw new Error('Storage providers must implement the `keys` method'); }
	public async get(key: string): Promise<string> { throw new Error('Storage providers must implement the `get` method'); }
	public async set(key: string, value: string): Promise<void> { throw new Error('Storage providers must implement the `set` method'); }
	public async remove(key: string): Promise<void> { throw new Error('Storage providers must implement the `remove` method'); }
	public async clear(): Promise<void> { throw new Error('Storage providers must implement the `clear` method'); }
}
