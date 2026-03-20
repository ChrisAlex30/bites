import express from 'express';
import { validate } from '../middlewares/validate.js';
import { restaurantSchema, type Restaurant } from '../schemas/restaurant.js';
import { getRedisClient } from '../utils/client.js';
const router = express.Router();

router.post('/', validate(restaurantSchema),async (req, res) => {
  const data=req.body as Restaurant;
  const client=await getRedisClient();
  res.send(`List of restaurants with name ${data.name}`);
});

export default router;