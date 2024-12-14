import db from '../models/index.cjs';


export const getFilteredProductsBySlug = async (genderCategory, category, slug, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // Define models and aliases for dynamic filtering
        const filterModelMap = {
            category: { model: db.Category, alias: 'categories' },
            color: { model: db.Color, alias: 'colors' },
            size: { model: db.Size, alias: 'sizes' },
            collection: { model: db.Collection, alias: 'collections' },
            scrub: { model: db.Scrub, alias: 'scrubs' },
        };

        // Validate category filter
        if (!filterModelMap[category]) {
            throw new Error('Invalid filter category provided');
        }

        // Create a condition only for the chosen filter (e.g., 'category', 'size', etc.)
        const filterConfig = filterModelMap[category];
        const whereClause = { slug: slug };

        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
            include: [
                // Include the selected filter model with a condition
                {
                    model: db.Category,
                    as: 'categories',
                    through: { attributes: [] },
                    where: { slug: genderCategory },  // Filter by category name
                },
                {
                    model: filterConfig.model,
                    as: filterConfig.alias,
                    where: whereClause,
                    through: { attributes: [] },
                },
                // Include colors without conditions to always attach them
                {
                    model: db.Color,
                    as: 'colors',
                    through: { attributes: [] },
                },
                {
                    model: db.Image,
                    as: 'images',
                    required: false,
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
        });

        const mappedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            categories: (product.categories || []).map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            images: (product.images || []).map((image) => ({
                id: image.id,
                url: image.url,
                alt_text: image.alt_text,
                is_primary: image.is_primary,
                productId: image.productId,
            })),
            colors: (product.colors || []).map((color) => ({
                id: color.id,
                name: color.name,
                hex_code: color.hex_code,
            })),
            sizes: (product.sizes || []).map((size) => ({
                id: size.id,
                name: size.name,
            })),
            collections: (product.collections || []).map((collection) => ({
                id: collection.id,
                name: collection.name,
            })),
            scrubs: (product.scrubs || []).map((scrub) => ({
                id: scrub.id,
                name: scrub.name,
            })),
        }));

        const totalProductPages = Math.ceil(totalProductItems / limit);

        return {
            products: mappedProducts,
            totalProductItems,
            totalProductPages,
            currentProductPage: page,
        };
    } catch (error) {
        console.error('Error in getFilteredProducts helper:', error);
        throw error;
    }
};


export const getFilteredProducts = async (category, page, limit) => {
    try {
        const offset = (page - 1) * limit;  // Calculate the offset for pagination
        const categoryId = category;

        // Fetch products filtered by the category with pagination
        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    through: { attributes: [] },
                    where: { slug: categoryId },  // Filter by category name
                },
                {
                    model: db.Image,
                    as: 'images',
                    required: false,
                },
                {
                    model: db.Color,
                    as: 'colors',
                    through: { attributes: [] },
                },
            ],
            limit,  // Limit the number of products per page
            offset,  // Offset to skip products for pagination
            distinct: true,  // Ensure unique products are counted
            order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
           
        });

        // Map the products to the desired format
        const mappedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            slug: product.slug,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            categories: product.categories.map(category => ({
                id: category.id,
                name: category.name,
                description: category.description,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            images: product.images.map(image => ({
                id: image.id,
                url: image.url,
                alt_text: image.alt_text,
                is_primary: image.is_primary,
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
                productId: image.productId,
            })),
            colors: product.colors.map(color => ({
                id: color.id,
                name: color.name,
                hex_code: color.hex_code,
                createdAt: color.createdAt,
                updatedAt: color.updatedAt,
            })),
        }));

        // Fetch all available filters (colors, sizes, collections, scrubs)
        const colors = await db.Color.findAll();
        const sizes = await db.Size.findAll();
        const collections = await db.Collection.findAll({
            include: [
                {
                    model: db.Product,
                    as: 'products',
                    include: [
                        {
                            model: db.Category,
                            as: 'categories',
                            where: { slug: categoryId },
                        },
                        {
                            model: db.Image,
                            as: 'images',
                            where: { is_primary: true },
                            required: false,
                        },
                    ],
                },
            ],
        });
        const scrubs = await db.Scrub.findAll();

        // Calculate total pages for pagination
        const totalProductPages = Math.ceil(totalProductItems / limit);

        return {
            products: mappedProducts,
            totalProductItems,
            totalProductPages,
            currentProductPage: page,
            colors: colors.map(color => color.get({ plain: true })),
            sizes: sizes.map(size => size.get({ plain: true })),
            collections: collections.map(collection => collection.get({ plain: true })),
            scrubs: scrubs.map(scrub => scrub.get({ plain: true })),
        };
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};

export const getMultipleFilteredProducts = async (filters, page, limit) => {
    try {
        const offset = (page - 1) * limit;  // Calculate the offset for pagination
        const { category, color, size, scrub, collection } = filters;  // Destructure filters from the query

        // Build the 'where' conditions dynamically
        const productWhere = {};
        const categoryWhere = {};
        const colorWhere = {};
        const sizeWhere = {};
        const collectionWhere = {};
        const scrubWhere = {};

        // Apply category filter if present
        if (category) {
            categoryWhere.slug = category;  // Filter by category name
        }

        // Apply color filter if present
        if (color) {
            colorWhere.name = color;  // Filter by color name
        }

        // Apply size filter if present
        if (size) {
            sizeWhere.name = size;  // Filter by size name
        }

        // Apply collection filter if present
        if (collection) {
            collectionWhere.name = collection;  // Filter by collection name
        }

        // Apply scrub filter if present
        if (scrub) {
            scrubWhere.name = scrub;  // Filter by scrub name
        }

        // Fetch products with filters applied, and pagination
        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
            where: productWhere,  // Apply product-specific filters
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    through: { attributes: [] },
                    where: Object.keys(categoryWhere).length ? categoryWhere : null,  // Apply category filter if provided
                },
                {
                    model: db.Color,
                    as: 'colors',
                    through: { attributes: [] },
                    where: Object.keys(colorWhere).length ? colorWhere : null,  // Apply color filter if provided
                    //separate: true,
                },
                {
                    model: db.Size,
                    as: 'sizes',
                    through: { attributes: [] },
                    where: Object.keys(sizeWhere).length ? sizeWhere : null,  // Apply size filter if provided
                },
                {
                    model: db.Collection,
                    as: 'collections',
                    through: { attributes: [] },
                    where: Object.keys(collectionWhere).length ? collectionWhere : null,  // Apply collection filter if provided
                },
                {
                    model: db.Scrub,
                    as: 'scrubs',
                    through: { attributes: [] },
                    where: Object.keys(scrubWhere).length ? scrubWhere : null,  // Apply scrub filter if provided
                },
                {
                    model: db.Image,
                    as: 'images',
                    required: false,  // Include images even if none are primary
                },
            ],
            limit,  // Limit the number of products per page
            offset,  // Offset to skip products for pagination
            distinct: true,  // Ensure unique products are counted
            order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
        });

        // Map the products to the desired format
        const mappedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            slug: product.slug,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            categories: product.categories.map(category => ({
                id: category.id,
                name: category.name,
                description: category.description,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            images: product.images.map(image => ({
                id: image.id,
                url: image.url,
                alt_text: image.alt_text,
                is_primary: image.is_primary,
                productId: image.productId,
            })),
            colors: product.colors.map(color => ({
                id: color.id,
                name: color.name,
                hex_code: color.hex_code,
            })),
            sizes: product.sizes.map(size => ({
                id: size.id,
                name: size.name,
            })),
            collections: product.collections.map(collection => ({
                id: collection.id,
                name: collection.name,
            })),
            scrubs: product.scrubs.map(scrub => ({
                id: scrub.id,
                name: scrub.name,
            })),
        }));

        // Fetch all available filters (colors, sizes, collections, scrubs)
        const colors = await db.Color.findAll();
        const sizes = await db.Size.findAll();
        const collections = await db.Collection.findAll();
        const scrubs = await db.Scrub.findAll();

        // Calculate total pages for pagination
        const totalProductPages = Math.ceil(totalProductItems / limit);

        return {
            products: mappedProducts,
            totalProductItems,
            totalProductPages,
            currentProductPage: page,
            colors: colors.map(color => color.get({ plain: true })),
            sizes: sizes.map(size => size.get({ plain: true })),
            collections: collections.map(collection => collection.get({ plain: true })),
            scrubs: scrubs.map(scrub => scrub.get({ plain: true })),
        };
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};