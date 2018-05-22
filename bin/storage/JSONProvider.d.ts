import { IStorageProvider } from './interface/IStorageProvider';
import { StorageProvider } from './StorageProvider';
export declare class JSONProvider extends StorageProvider implements IStorageProvider {
    private readonly _name;
    private _db;
    constructor(name: string);
    init(): Promise<void>;
    keys(): Promise<string[]>;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
