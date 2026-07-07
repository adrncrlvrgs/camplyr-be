import {ZodError } from "zod";

export type FieldErrors = Record<string, string>;

export function zodFieldErrors(error: ZodError):FieldErrors {
    const errors : FieldErrors = {};

    error.issues.forEach((issue)=>{
        const fieldName = issue.path[0];

        if(typeof fieldName === "string" && !errors[fieldName]){
            errors[fieldName] = issue.message;
        }
    });
    return errors;
}