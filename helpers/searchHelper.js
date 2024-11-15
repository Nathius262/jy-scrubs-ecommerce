import db from '../models/index.cjs';
import { Op, Sequelize } from 'sequelize';

export const searchAll = async ({
    searchTerm = '',
    page,
    limit,
}) => {
    try {
        const offset = (page - 1) * limit;
        const lowerSearchTerm = searchTerm.toLowerCase();

        const searchFilter = searchTerm
            ? {
                  [Op.or]: [
                      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('product.name')), {
                          [Op.like]: `%${lowerSearchTerm}%`,
                      }),
                      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('product.description')), {
                          [Op.like]: `%${lowerSearchTerm}%`,
                      }),
                      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('product.price')), {
                          [Op.like]: `%${lowerSearchTerm}%`,
                      }),
                  ],
              }
            : {};

        // Search for products
        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
            attributes: ['name', 'id', 'slug', 'price', 'description', 'updatedAt'], // Only fetch these attributes
            where: searchFilter,
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    required: false,
                    through: { attributes: [] },
                },
                {
                    model: db.Color,
                    as: 'colors',
                    required: false,
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
            order: [['updatedAt', 'DESC']],
        });

        // Search for scrubs
        const scrubs = await db.Scrub.findAll({
            attributes:['name', 'id', 'slug',],
            where: searchTerm
                ? Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('scrub.name')), {
                      [Op.like]: `%${lowerSearchTerm}%`,
                  })
                : {},
        });

        // Search for colors
        const colors = await db.Color.findAll({
            attributes:['name', 'id', 'slug', 'hex_code', 'image_url'],
            where: searchTerm
                ? Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('color.name')), {
                      [Op.like]: `%${lowerSearchTerm}%`,
                  })
                : {},
        });

        // Search for sizes
        const sizes = await db.Size.findAll({
            attributes:['name', 'id', 'slug',],
            where: searchTerm
                ? Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('size.name')), {
                      [Op.like]: `%${lowerSearchTerm}%`,
                  })
                : {},
        });

        // Map products to the desired format
        const mappedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            slug: product.slug,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            categories: product.categories.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description,
            })),
            colors: product.colors.map((color) => ({
                id: color.id,
                name: color.name,
                hex_code: color.hex_code,
            })),
            images: product.images.map((image) => ({
                id: image.id,
                url: image.url,
                alt_text: image.alt_text,
                is_primary: image.is_primary,
            })),
        }));

        const mappedScrubs = scrubs.map((scrub) => ({
            id: scrub.id,
            name: scrub.name,
            slug: scrub.slug
        }));

        const mappedSizes = sizes.map((size) => ({
            id: size.id,
            name: size.name,
            slug: size.slug
        }));

        const mappedColors = colors.map((color) => ({
            id: color.id,
            name: color.name,
            hex_code: color.hex_code,
            slug: color.slug,
            image_url:color.image_url
        }));

        // Calculate total pages for pagination
        const totalProductPages = Math.ceil(totalProductItems / limit);

        return {
            products: mappedProducts,
            totalProductItems,
            totalProductPages,
            currentProductPage: page,
            scrubs: mappedScrubs,
            colors: mappedColors,
            sizes: mappedSizes,
            searchTerm:searchTerm
        };
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        throw error;
    }
};
