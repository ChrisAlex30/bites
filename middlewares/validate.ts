import type { Request,Response,NextFunction } from "express";
import { z } from "zod";

export const validate =<T> (schema: z.ZodType<T>) => 
(req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: result.error.issues
        })
    }
    req.body = result.data;
    next(); 
}
