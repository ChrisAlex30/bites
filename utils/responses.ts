import type { Response } from 'express';
import { success } from 'zod';

export const successResponse = (res: Response, data: any, message: string = 'Success') => {
    res.status(200).json({
        success: true,
        message,
        data
    });
};  

export const errorResponse = (res: Response, error: any, message: string = 'Error', statusCode: number = 500) => {
    res.status(statusCode).json({
        success: false, 
        message,
        error
    });
};  