import { z }  from "zod";

export const reviewSchema = z.object({
    review: z.string().min(1, 'Review is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5'),
});

export type Review = z.infer<typeof reviewSchema>;