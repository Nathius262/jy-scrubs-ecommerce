import db from '../models/index.cjs';
import { Op, Sequelize } from 'sequelize';

export const searchAll = async ({
    searchTerm = '',
    page,
    limit
}) => {
    try {
        const offset = (page - 1) * limit;

        // Convert search term to lowercase for case-insensitive search
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Define main search condition for Product name and description using LOWER() and LIKE
        const productSearchCondition = searchTerm
            ? {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
                        [Op.like]: `%${lowerSearchTerm}%`
                    }),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), {
                        [Op.like]: `%${lowerSearchTerm}%`
                    }),
                ],
            }
            : {};
        // Fetch products with related model filtering
        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
            where: productSearchCondition,
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    where: relatedSearchCondition,  // Apply filtering condition here
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: db.Color,
                    as: 'colors',
                    where: relatedSearchCondition,  // Apply filtering condition here
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: db.Size,
                    as: 'sizes',
                    where: relatedSearchCondition,  // Apply filtering condition here
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: db.Collection,
                    as: 'collections',
                    where: relatedSearchCondition,  // Apply filtering condition here
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: db.Scrub,
                    as: 'scrubs',
                    where: relatedSearchCondition,  // Apply filtering condition here
                    through: { attributes: [] },
                    required: false,
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

        // Map products to the desired format
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
            })),
            colors: product.colors.map(color => ({
                id: color.id,
                name: color.name,
                hex_code: color.hex_code,
            })),
            scrubs: product.scrubs.map(scrub => ({
                id: scrub.id,
                name: scrub.name,
            })),
            collections: product.collections.map(collection => ({
                id: collection.id,
                name: collection.name,
            })),
            sizes: product.sizes.map(size => ({
                id: size.id,
                name: size.name,
            })),
            images: product.images.map(image => ({
                id: image.id,
                url: image.url,
                alt_text: image.alt_text,
                is_primary: image.is_primary,
            })),
        }));

        // Calculate total pages for pagination
        const totalProductPages = Math.ceil(totalProductItems / limit);

        return {
            products: mappedProducts,
            totalProductItems,
            totalProductPages,
            currentProductPage: page,
        };
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};
