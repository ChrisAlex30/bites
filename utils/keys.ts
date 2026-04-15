export function getKeyName(...args:string[]) {
    return `bites:${args.join(':')}`;
}


export const restaurantKeyById = (id:string) => getKeyName('restaurant', id);

export const restaurantIdsKey = () => getKeyName('restaurant', 'ids');


export const reviewKeyById = (id:string) => getKeyName('reviews', id);

export const reviewDetailsKeyById = (id:string) => getKeyName('reviewDetails', id); 