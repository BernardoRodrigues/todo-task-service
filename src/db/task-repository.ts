import { TaskModel } from './../models/task-model';
import { DbConnection } from "./db-connection";
import { request } from 'https'
import { TodoModel } from '../models/todo-model';
import { encodeString, decodeString } from '../util/repo.util';

export class TaskRepository {

    constructor(private db: DbConnection) {}

    private mapper(res: {endpoint: string, p256dh: string, auth: string, userid: string, todoid: string, startDate: string | Date, endDate: string | Date, title: string, priorityId: number, priorityValue: string})
    : {task: TaskModel, todo: TodoModel} {
        return {
            task: {
                endpoint: res.endpoint,
                userId: res.userid,
                p256dh: Buffer.from(res.p256dh, 'utf-8').toString('base64'),
                auth: Buffer.from(res.auth, 'utf-8').toString('base64')
            },
            todo: {
                id: res.todoid,
                startDate: new Date(res.startDate),
                endDate: new Date(res.endDate),
                title: res.title,
                priority: {
                    value: res.priorityId,
                    name: res.priorityValue
                }
            }
        };
    }


    public async getBetweenDates(): Promise<{task: TaskModel, todo: TodoModel}[]> {
        try {
            const { rows } = await this.db.query(
                `select tt.endpoint as endpoint, tt.auth_key as auth, tt.p256dh_key as p256dh, td.todo_start_date as startDate, td.todo_end_date as endDate, td.todo_id as todoId, 
                td.title as title, p.priority_id as priorityId, p.priority_value as priorityValue, tt.user_id as userId
                from to_do as td 
                inner join priority as p on p.priority_id = td.priority_id 
                inner join todo_task as tt on tt.user_id = tt.user_id 
                where td.is_done = false and td.is_cancelled = false;`,
                []
            )
            return rows.map(this.mapper)
        } catch(err) {
            console.error(err);
            //TODO throw custom error
            throw err;
        }
    }

    public async subscribe(task: TaskModel): Promise<any> {
        try {
            // const auth = Buffer.from(task.auth, 'base64').toString('utf-8')
            // const p256dh = Buffer.from(task.auth, 'base64').toString('utf-8')
            const { rows } = await this.db.query(
                "insert into todo_task(endpoint, user_id, p256dh_key, auth_key) values ($1, $2, $3, $4) on conflict do nothing",
                [task.endpoint, task.userId, task.p256dh, task.auth]
            )
            return rows[0]
        } catch(err) {
            console.error(err)
            throw err;
        }
    }

    public async unsubscribe(endpoint: string): Promise<any> {
        try {
            const { rows } = await this.db.query(
                "delete from todo_task where endpoint = $1",
                [endpoint]
            )
            return rows[0]
        } catch(err) {
            console.error(err)
            throw err;
        }
    }

}