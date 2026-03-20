import type { Request,Response,NextFunction } from "express";
import { errorResponse } from "../utils/responses.js";
import { getRedisClient } from "../utils/client.js";
import { restaurantKeyById } from "../utils/keys.js";

export const checkRestaurantExists= async function (req:Request<{restaurantId: string}> , res : Response, next: NextFunction) {
    const { restaurantId } = req.params;

    if(!restaurantId){
        return errorResponse(res, null, 'Restaurant ID is required', 400);
    }

    const client = await getRedisClient();
    const restaurantKey = restaurantKeyById(restaurantId);
    const exists = await client.exists(restaurantKey);

    if (!exists) {
        return errorResponse(res, null, 'Restaurant not found', 404);
    }
    next();

}