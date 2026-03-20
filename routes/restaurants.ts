import express , {type Request} from 'express';
import { validate } from '../middlewares/validate.js';
import { restaurantSchema, type Restaurant } from '../schemas/restaurant.js';
import { getRedisClient } from '../utils/client.js';
import { nanoid } from 'nanoid';
import { restaurantKeyById } from '../utils/keys.js';
import { successResponse } from '../utils/responses.js';
import { checkRestaurantExists } from '../middlewares/checkRestaurantId.js';
const router = express.Router();

router.post('/', validate(restaurantSchema),async (req, res,next) => {
  const data=req.body as Restaurant;  
  try {
    const client=await getRedisClient();
    const id=nanoid();
    const restaurantKey=restaurantKeyById(id);
    const hashData={
        id,
        name:data.name,
        cuisine:data.location,
    };
    const addResult=await client.hSet(restaurantKey, hashData);
    console.log(`Added ${addResult} fields`);
    return successResponse(res, hashData, 'Restaurant added successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/:restaurantId', checkRestaurantExists, async (req:Request<{restaurantId: string}>, res, next) => {

    const { restaurantId } = req.params;
    try {
        const client = await getRedisClient();
        const restaurantKey = restaurantKeyById(restaurantId);
        const restaurantData = await client.hGetAll(restaurantKey);
        return successResponse(res, restaurantData, 'Restaurant data retrieved successfully');
    } catch (error) {
        next(error);
    }
});



export default router;