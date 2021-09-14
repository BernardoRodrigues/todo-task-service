import { TaskModel } from './../models/task-model';
import { Router } from "express";
import { DbConnection } from "../db/db-connection";
import { TaskRepository } from "../db/task-repository";
import { DbConfig } from "../models/db-config";
import { NextFunction, ParamsDictionary, Request, Response } from 'express-serve-static-core';
import QueryString from 'qs';
import axios from 'axios';
import { InvalidJwtError } from '../errors/invalid-jwt.error';
import { Agent } from 'https';
import { checkIfNullOfUndefined } from '../util/repo.util';
import { MissingValuesError } from '../errors/missing-values.error';
import { BaseError } from '../errors/base.error';
import { CodeError } from '../errors/code.error';
import { ServiceNotAvailableError } from '../errors/service-not-available.error';
import { MissingJwtError } from '../errors/missing-jwt.error';


const config: DbConfig = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT == null ? 5432 : +process.env.DB_PORT,
    database: process.env.DB_NAME || "todo_db",
    host: process.env.DB_HOST || "localhost"
}
const connection = new DbConnection(config);
const taskRep = new TaskRepository(connection)
// const granularity = process.env.GRANULARITY == null ? 1 : +process.env.GRANULARITY
const taskRouter = Router()
const instance = axios.create({httpsAgent: new Agent({rejectUnauthorized: false}), proxy: false})
const getUserIdFromJwt = async (req: any): Promise<string> => {
    if (req.headers.authorization == null) {
        throw new MissingJwtError('jwt is null');
    }
    const token = req.headers.authorization.split(" ")[1]
    if (token == null) {
        throw new MissingJwtError('jwt is null');
    }
    const res = await instance.get(`${process.env.USER_SERVICE_PATH}/verify-jwt?token=${token}`)
    switch(res.status) {
        case 200:
            return res.data.value.id;
        case 400:
            throw new InvalidJwtError("Not Authorized");
        default:
        case 500:
            throw new ServiceNotAvailableError("Service not available")
    } 
}

const authRequest = async (req: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: NextFunction) => {
    const auth = req.headers.authorization;
    
    if (auth == null || auth == '' || auth === undefined) {
        return res.status(401).json({message: "Unauthorized"})
    }
    const split = auth.split(" ")
    const token = split[1];
    const result = await axios.get(`${process.env.USER_SERVICE_PATH}/verify-jwt?token=${token}`);
    // req.jwt = result.data;
    if (result.status === 200) {
        return next();
    }
    return next(new InvalidJwtError("Jwt is invalid or non existant"))
}


taskRouter.post('/subscribe', async (req, res) => {
    try {
        const task: TaskModel = {...req.body, userId: await getUserIdFromJwt(req)};
        const check = checkIfNullOfUndefined(task.auth, task.endpoint, task.p256dh)
        if (check != null) {
            throw new MissingValuesError(`${check} cannot be null`)
        }
        
        const result = await taskRep.subscribe(task);
        return res.status(201).json(result)
    } catch(ex) {
        console.error("Error at Task-route-subscribe", ex)
        return handleError(ex, res);
    }
})

taskRouter.post('/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body
        const check = checkIfNullOfUndefined(endpoint)
        if (check != null) {
            throw new MissingValuesError(`${check} cannot be null`)
        }
        const result = await taskRep.unsubscribe(endpoint);
        return res.status(201).json(result)
    } catch(err) {
        console.error("Error at Task-route-unsubscribe", err)
        return handleError(err, res)
    }
})

export default taskRouter;
function handleError(ex: any, res: Response<any, Record<string, any>, number>) {
    const err: BaseError = ex;
    switch (err.code) {
        case CodeError.MissingValues:
            return res.status(400).json(err.message);
        case CodeError.DbNotAvailable:
        case CodeError.ServiceNotAvailable:
        default:
            return res.status(500).json({ message: "Server error" });
        case CodeError.MissingJwt:
        case CodeError.InvalidJwt:
            return res.status(405).json({ message: "Unauthorized" });
    }
}
