import { BaseError } from "./base.error";
import { CodeError } from "./code.error";

export class MissingValuesError extends BaseError {

    constructor(message: string) {
        super(message, CodeError.MissingValues)
    }

}