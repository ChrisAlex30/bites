import express from 'express';
import cuisineRouter from './routes/cuisines.js';
import restaurantRouter from './routes/restaurants.js';
import { errorHandler } from './middlewares/errorHandler.js';


const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/cuisines', cuisineRouter);
app.use('/restaurants', restaurantRouter);      



app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});
