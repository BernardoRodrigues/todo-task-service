import { BaseError } from "./base.error";
import { CodeError } from "./code.error";

export class DbNotAvailableError extends BaseError {

    constructor(message: string) {
        super(message, CodeError.DbNotAvailable)
    }

}