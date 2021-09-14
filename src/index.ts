import { resolve } from 'path'
import { config  } from 'dotenv';
console.log(resolve(__dirname, '..', '..', 'environments', `${process.env.NODE_ENV}.env`))
config(
    {
        path: resolve(__dirname, '..', '..', 'environments', `${process.env.NODE_ENV}.env`)
    }
)
import { DbConfig } from './models/db-config';
import { DbConnection } from './db/db-connection';
import { TaskRepository } from './db/task-repository';
import express from 'express'
import logger from 'morgan'
import { RecurrenceRule, scheduleJob } from 'node-schedule'
import { sendNotification, PushSubscription, setVapidDetails } from 'web-push'
import { createServer } from 'https'
import axios from 'axios'
// import { createServer as httpCreateServer } from 'http'
import { json } from 'body-parser';
import taskRouter from './routes/task-routes'
import { NotificationModel } from './models/notification-model';
import {readFileSync} from 'fs'

// if (process.env.GRANULARITY == null || process.env.GRANULARITY === '') {
//     throw new Error('GRANULARITY cant be empty')
// }
//nn-format
// -h > 24
// 
const dbConfig: DbConfig = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT == null ? 5432 : +process.env.DB_PORT,
    database: process.env.DB_NAME || "todo_db",
    host: process.env.DB_HOST || "localhost"
}

const keys: {private: string, public: string} = JSON.parse(readFileSync(resolve(__dirname, "files", "keys.json")).toString())
setVapidDetails(
    `mailto:${process.env.VAPID_MAIL || "bernardo.qtr.21@gmail.com"}`,
    keys.public,
    keys.private
)

const connection = new DbConnection(dbConfig);
const taskRep = new TaskRepository(connection)
// const granularity = +process.env.GRANULARITY
// TODO add formating for granularity
console.log("creating job")
//always runs at 4 am
const rule = new RecurrenceRule()
rule.minute = 2;
const job = scheduleJob("database check", "*/1 * * * *", async (fireDate: Date) => {
    
    const results = await taskRep.getBetweenDates();
    for(const res of results) {
        const subscription: PushSubscription = {
            endpoint: res.task.endpoint,
            keys: {
                p256dh: Buffer.from(res.task.p256dh, 'base64').toString(),
                auth: Buffer.from(res.task.auth, 'base64').toString()
            }
        }
        let bytes = (new TextEncoder().encode(subscription.keys.p256dh)).length;
        console.log("p256dh size in bytes: ", bytes)
        console.log("atob: ", Buffer.from(res.task.p256dh).toString('utf-8'))
        const notification: NotificationModel = {...res.todo, priorityName: res.todo.priority.name, priorityValue: res.todo.priority.value}
        try  {
            const payload = {
                notification: {
                    title: res.todo.title,
                    actions:[{title:"View App",action:"view_app"}],
                    body:"test",
                    data: notification
                }
            }
            const result = await sendNotification(subscription, JSON.stringify(payload));
            const code = result.statusCode;
            if (code === 410 || code === 404) {
                await taskRep.unsubscribe(res.task.endpoint)
            }
        } catch(err) {
            console.error(err);
        }
    }
})
const port = process.env.PORT || 4330
const version = `v${require(resolve(__dirname, '..', 'package.json')).version.split('.')[0]}`
const app = express()
const server = createServer(
    {
        cert: readFileSync(resolve(__dirname, 'cert', 'task-service.crt')),
        key: readFileSync(resolve(__dirname, 'cert', 'task-service.key'))
    },
    app.use(logger('dev'))
        .use(json())
        // .use(cors()) 
        .use(`/service/task`, taskRouter)
        .use('*', (_, res) => res.status(404).json({message: "Not Found"}))
)
.listen(port, () => {console.log(`Server started on port ${port}`)})

process.on("SIGINT", () => {
    console.log("Server closing")
    const res = job.cancel(false);  
    server.close();
})




