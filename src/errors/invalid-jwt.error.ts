import { BaseError } from "./base.error";
import { CodeError } from "./code.error";

export class InvalidJwtError extends BaseError {
    constructor(message: string) {
        super(message, CodeError.InvalidJwt)
    }
}