import { DbConfig } from './../models/db-config';
import { ClientConfig, Pool } from "pg";

export class DbConnection {

    private pool: Pool;

    /**
     *Creates an instance of TodoRepository.
     * @param {DbConnection} connection
     * @memberof TodoRepository
     */
    constructor(private connection: DbConfig | string) {
        if (connection == null) {
            throw new Error("connection cannot be null")
        }
        if (typeof connection === 'string') {
            this.pool = new Pool({connectionString: this.connection as string})
            return;
        }
        const config: ClientConfig = this.connection as DbConfig;
        this.pool = new Pool(config);
    }

    query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }


}