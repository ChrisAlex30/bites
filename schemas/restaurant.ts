import {z} from 'zod';

export const restaurantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    location: z.string().min(1, 'Location is required'),
    cuisines: z.array(z.string().min(1, 'Cuisine name cannot be empty'))
});

export const restaurantDetailsSchema = z.object({
    links:z.array(z.object({
        name: z.string().min(1, 'Link name is required'),
        url: z.string().min(1, 'Url is required'),
    })),
    contact:z.object({
        phone: z.string().min(1, 'Phone number is required'),
        email: z.email('Invalid email address'),
    })
    
});

export type RestaurantDetails = z.infer<typeof restaurantDetailsSchema>;

export type Restaurant = z.infer<typeof restaurantSchema>;