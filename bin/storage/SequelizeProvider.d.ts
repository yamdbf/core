import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
export declare enum Dialect {
    Postgres = 0,
    SQLite = 1,
    MSSQL = 2,
    MySQL = 3
}
export declare function SequelizeProvider(url: string, dialect: Dialect, debug: boolean): StorageProviderConstructor;
