import db from '../models/index.cjs';
import cloudinary from '../config/cloudinary.js';
import { getPublicIdFromUrl } from '../utils/utils.js';


// Helper function to fetch all products with pagination
export const getAllProducts = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;  // Calculate offset for pagination

        // Fetch products with their relationships, and apply pagination
        const { rows: products, count: totalItems } = await db.Product.findAndCountAll({
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Color,
                    as: 'colors',
                    through: { attributes: [] },
                },
                {
                    model: db.Size,
                    as: 'sizes',
                    through: { attributes: [] },
                },
                {
                    model: db.Collection,
                    as: 'collections',
                    through: { attributes: [] },
                },
                {
                    model: db.Scrub,
                    as: 'scrubs',
                    through: { attributes: [] },
                },
                {
                    model: db.Image,
                    as: 'images',
                    attributes: ['url'],  // Only return image URLs
                },
            ],
            limit,
            offset,
        });

        // Return plain objects and pagination information
        return {
            products: products.map(product => product.get({ plain: true })),
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    } catch (error) {
        throw error;
    }
};


export const getProductById = async (id) => {
    try {
        const product = await db.Product.findByPk(id, {
            include: [
                { model: db.Category, as: 'categories', through: { attributes: [] } },
                { model: db.Color, as: 'colors', through: { attributes: [] } },
                { model: db.Size, as: 'sizes', through: { attributes: [] } },
                { model: db.Collection, as: 'collections', through: { attributes: [] } },
                { model: db.Scrub, as: 'scrubs', through: { attributes: [] } },
                { model: db.Image, as: 'images', attributes: ['url'] },
            ],
        });
        if (!product) return null;
        return product.get({ plain: true });
    } catch (error) {
        throw error;
    }
};

export const createProduct = async (productData) => {
    const { name, description, price, stock, categoryIds, colorIds, sizeIds, collectionIds, scrubIds, images } = productData;

    try {
        const newProduct = await db.Product.create({ name, description, price, stock });

        // Handle many-to-many relationships
        if (categoryIds) {
            const categories = await db.Category.findAll({ where: { id: categoryIds } });
            await newProduct.addCategories(categories);
        }
        if (colorIds) {
            const colors = await db.Color.findAll({ where: { id: colorIds } });
            await newProduct.addColors(colors);
        }
        if (sizeIds) {
            const sizes = await db.Size.findAll({ where: { id: sizeIds } });
            await newProduct.addSizes(sizes);
        }
        if (collectionIds) {
            const collections = await db.Collection.findAll({ where: { id: collectionIds } });
            await newProduct.addCollections(collections);
        }
        if (scrubIds) {
            const scrubs = await db.Scrub.findAll({ where: { id: scrubIds } });
            await newProduct.addScrubs(scrubs);
        }

        // Handle image upload
        if (images && images.length > 0) {
            const imagePromises = images.map(imageUrl => db.Image.create({ url: imageUrl, productId: newProduct.id }));
            await Promise.all(imagePromises);
        }

        return newProduct.get({ plain: true });
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    const { name, description, price, stock, categoryIds, colorIds, sizeIds, collectionIds, scrubIds, images } = productData;

    try {
        const product = await db.Product.findByPk(id, { include: db.Image });
        if (!product) return null;

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        await product.save();

        // Update many-to-many relationships
        if (categoryIds) {
            const categories = await db.Category.findAll({ where: { id: categoryIds } });
            await product.setCategories(categories);
        }
        if (colorIds) {
            const colors = await db.Color.findAll({ where: { id: colorIds } });
            await product.setColors(colors);
        }
        if (sizeIds) {
            const sizes = await db.Size.findAll({ where: { id: sizeIds } });
            await product.setSizes(sizes);
        }
        if (collectionIds) {
            const collections = await db.Collection.findAll({ where: { id: collectionIds } });
            await product.setCollections(collections);
        }
        if (scrubIds) {
            const scrubs = await db.Scrub.findAll({ where: { id: scrubIds } });
            await product.setScrubs(scrubs);
        }

        // Handle image updates
        if (images && images.length > 0) {
            const oldImages = await db.Image.findAll({ where: { productId: product.id } });
            for (const oldImage of oldImages) {
                await cloudinary.uploader.destroy(getPublicIdFromUrl(oldImage.url, { resource_type: 'image' }));
            }
            await db.Image.destroy({ where: { productId: product.id } });
            const imagePromises = images.map(imageUrl => db.Image.create({ url: imageUrl, productId: product.id }));
            await Promise.all(imagePromises);
        }

        return product.get({ plain: true });
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const product = await db.Product.findByPk(id, { include: db.Image });
        if (!product) return null;

        const images = await db.Image.findAll({ where: { productId: product.id } });
        for (const image of images) {
            await cloudinary.uploader.destroy(getPublicIdFromUrl(image.url, { resource_type: 'image' }));
        }

        await db.Image.destroy({ where: { productId: product.id } });
        await product.destroy();
        return true;
    } catch (error) {
        throw error;
    }
};
