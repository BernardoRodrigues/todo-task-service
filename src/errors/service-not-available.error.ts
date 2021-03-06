import { BaseError } from "./base.error";
import { CodeError } from "./code.error";

export class ServiceNotAvailableError extends BaseError {

    constructor(message: string) {
        super(message, CodeError.ServiceNotAvailable)
    }

}