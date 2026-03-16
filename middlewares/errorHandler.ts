import type { Request,Response,NextFunction } from "express";
import { errorResponse } from "../utils/responses.js";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    errorResponse(res, err, 'An error occurred', 500);
};

