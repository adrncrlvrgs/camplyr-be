import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { zodFieldErrors } from "../utils/validation/zodError.utils";

export function validateBody<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation Failed",
        errors: zodFieldErrors(result.error),
      });

      return;
    }

    req.body = result.data;

    next();
  };
}
