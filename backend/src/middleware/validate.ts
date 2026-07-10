import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Generic request-body validator. Usage:
 *
 *   router.patch("/thing/:id", validateBody(updateThingSchema), handler);
 *
 * On failure, responds 400 with a flat list of field-level issues instead
 * of letting bad data reach Mongoose (or crash the handler on `undefined`).
 * On success, replaces req.body with the *parsed* (and coerced/defaulted)
 * value, so handlers can trust their types.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request body.",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}
