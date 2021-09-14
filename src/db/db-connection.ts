import {  Pool } from "pg";

export class DbConnection {

    private pool: Pool;

    /**
     *Creates an instance of TodoRepository.
     * @param {DbConnection} connection
     * @memberof TodoRepository
     */
    constructor(private config: string) {
        if (process.env.NODE_ENV === 'production') {
            this.pool = new Pool({connectionString: this.config, ssl:{rejectUnauthorized: false}});
        } else {
            this.pool = new Pool();
        }
    }

    query(text: string, params: any[] = []) {
        return this.pool.query(text, params);
    }


}