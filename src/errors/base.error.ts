import { CodeError } from "./code.error";

export class BaseError extends Error {

    public code: CodeError;

    constructor(message: string, code: CodeError) {
        super(message);
        this.code = code;
    }

}