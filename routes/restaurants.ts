import express , {type Request} from 'express';
import { validate } from '../middlewares/validate.js';
import { restaurantSchema, type Restaurant } from '../schemas/restaurant.js';
import { getRedisClient } from '../utils/client.js';
import { nanoid } from 'nanoid';
import { restaurantIdsKey, restaurantKeyById, reviewDetailsKeyById, reviewKeyById } from '../utils/keys.js';
import { errorResponse, successResponse } from '../utils/responses.js';
import { checkRestaurantExists } from '../middlewares/checkRestaurantId.js';
import { reviewSchema, type Review } from '../schemas/review.js';
const router = express.Router();

router.post('/', validate(restaurantSchema),async (req, res,next) => {
  const data=req.body as Restaurant;  
  try {
    const client=await getRedisClient();
    const id=nanoid();
    const restaurantKey=restaurantKeyById(id);
    const restaurantIds=restaurantIdsKey();
    const hashData={
        id,
        name:data.name,
        location:data.location,
        cuisine:JSON.stringify(data.cuisines)
    };

    const pipeline = client.multi();
    pipeline.hSet(restaurantKey, hashData);
    pipeline.sAdd(restaurantIds, id);

    await pipeline.exec();
    return successResponse(res, hashData, 'Restaurant added successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const client = await getRedisClient();
    const restaurantIds = restaurantIdsKey();
    const ids = await client.sMembers(restaurantIds);

    if (!ids.length) {
      return successResponse(res, [], 'No restaurants found');
    }
    const restaurantsData = await Promise.all(
      ids.map(id => client.hGetAll(restaurantKeyById(id)))
    );

    return successResponse(res, restaurantsData, 'Restaurants retrieved successfully');
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
        if(!restaurantData || Object.keys(restaurantData).length === 0) {
            return errorResponse(res, restaurantId, 'Restaurant not found', 404);
        }
        return successResponse(res, restaurantData, 'Restaurant data retrieved successfully');
    } catch (error) {
        next(error);
    }
});

router.post('/:restaurantId/reviews', checkRestaurantExists, validate(reviewSchema), async (req:Request<{restaurantId: string}>, res, next) => {
    const { restaurantId } = req.params;
    const reviewData = req.body as Review;
    try {        
        const client = await getRedisClient();
        const reviewId = nanoid();
        const reviewKey = reviewKeyById(restaurantId);
        const reviewDetailsKey = reviewDetailsKeyById(reviewId);
        const reviewHashData = {
            id: reviewId,...reviewData,timestamp: Date.now(),restaurantId
        };
        const pipeline = client.multi();
        pipeline.hSet(reviewDetailsKey, reviewHashData);
        pipeline.zAdd(reviewKey, {
            score: Date.now(),
            value: reviewId
        });

        await pipeline.exec();

        return successResponse(res, reviewHashData, 'Review added successfully');
    }
    catch (error) {
        next(error);
    }
});

router.get('/:restaurantId/reviews', checkRestaurantExists, async (req:Request<{restaurantId: string}>, res, next) => {
    const { restaurantId } = req.params;
    const {page=1, limit=10} = req.query;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit)-1
    
    try{
        const client = await getRedisClient();
        const reviewKey = reviewKeyById(restaurantId);
        const reviewIds = await client.zRange(reviewKey, startIndex, endIndex, {
                    REV: true
                }); 
        const reviewDetailsKeys = reviewIds.map(id => reviewDetailsKeyById(id));
        const reviewsData = await Promise.all(reviewDetailsKeys.map(key => client.hGetAll(key)));
        return successResponse(res, reviewsData, 'Reviews retrieved successfully');
    }catch (error) {
        next(error);
    }
});

router.get('/:restaurantId/reviews/:reviewId', checkRestaurantExists, async (req:Request<{restaurantId: string, reviewId: string}>, res, next) => {
    const { reviewId } = req.params;
    try {
        const client = await getRedisClient(); 
        const reviewDetailsKey = reviewDetailsKeyById(reviewId);
        const reviewData = await client.hGetAll(reviewDetailsKey);
        if(!reviewData || Object.keys(reviewData).length === 0) {
            return errorResponse(res, reviewId, 'Review not found', 404);
        }
        return successResponse(res, reviewData, 'Review retrieved successfully');
    } catch (error) {
        next(error);
    }
});

router.delete('/:restaurantId/reviews/:reviewId', checkRestaurantExists, async (req:Request<{restaurantId: string, reviewId: string}>, res, next) => {
    const { restaurantId, reviewId } = req.params;
    try {
        const client = await getRedisClient();
        const reviewKey = reviewKeyById(restaurantId);  
        const reviewDetailsKey = reviewDetailsKeyById(reviewId);

        const pipeline = client.multi();
        pipeline.zRem(reviewKey, reviewId);
        pipeline.del(reviewDetailsKey);
        const results = await pipeline.exec();

        if (!results) throw new Error('Transaction failed');

        const removeResult = Number(results[0]);
        const deleteResult = Number(results[1]);

        if(removeResult === 0 || deleteResult === 0) {
            return errorResponse(res, reviewId, 'Review not found', 404);
        }
        return successResponse(res, null, 'Review deleted successfully');
    } catch (error) {
        next(error);
    }
});

export default router;