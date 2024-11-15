import db from '../models/index.cjs';


const cache = {
    globalEntities: null,
    lastFetched: null,
    cacheDuration: 3600000, // Cache duration in milliseconds (1 hour)
};

const fetchGlobalEntitiesWithCache = async (req, res, next) => {
    try {
        const now = Date.now();

        // Check if the cache is still valid
        if (cache.globalEntities && (now - cache.lastFetched < cache.cacheDuration)) {
            res.locals.globalEntities = cache.globalEntities; // Use cached data
            return next();
        }

        // Fetch all entities from the database
        const scrubs = (await db.Scrub.findAll({
            attributes: ['id', 'name', 'slug'], // Select relevant fields
        })).map(scrub => ({
            id: scrub.id,
            name: scrub.name,
            slug: scrub.slug,
        }));
        
        const categories = (await db.Category.findAll({
            attributes: ['id', 'name', 'slug'], // Select relevant fields
        })).map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
        }));
        
        const collections = (await db.Collection.findAll({
            attributes: ['id', 'name', 'slug'], // Select relevant fields
        })).map(collection => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
        }));
        
        const colors = (await db.Color.findAll({
            attributes: ['id', 'name', 'hex_code', 'image_url', 'slug'], // Select relevant fields
        })).map(color => ({
            id: color.id,
            name: color.name,
            hex_code: color.hex_code, // Use camelCase for hexCode
            image_url: color.image_url, // Use camelCase for imageUrl
            slug: color.slug,
        }));
        
        const sizes = (await db.Size.findAll({
            attributes: ['id', 'name', 'slug'], // Select relevant fields
        })).map(size => ({
            id: size.id,
            name: size.name,
            slug: size.slug,
        }));
        

        // Update the cache
        cache.globalEntities = {
            scrubs,
            categories,
            collections,
            colors,
            sizes,
        };
        cache.lastFetched = now;

        // Attach to res.locals for use in Handlebars
        res.locals.globalEntities = cache.globalEntities;
        next();
    } catch (error) {
        console.error('Error fetching global entities with cache:', error);
        next(error);
    }
};

export default fetchGlobalEntitiesWithCache;
