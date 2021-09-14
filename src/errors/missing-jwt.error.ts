import { BaseError } from "./base.error";
import { CodeError } from "./code.error";

export class MissingJwtError extends BaseError {

    constructor(message: string) {
        super(message, CodeError.MissingJwt)
    }

}