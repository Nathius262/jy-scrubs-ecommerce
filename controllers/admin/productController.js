import db from '../../models/index.cjs'; // Adjust the path as necessary
import cloudinary from '../../config/cloudinary.js';
import {getPublicIdFromUrl} from '../../utils/utils.js'

// Get all products with their categories
export const getAllProducts = async (req, res) => {
    try {
        const products = await db.Product.findAll({
            include: {
                model: db.Category,
                as: 'categories',  // Alias used in the model
                through: { attributes: [] },  // Exclude the join table attributes
            },
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single product with categories
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(id, {
            include: [
                {
                    model: db.Category,
                    as: 'categories',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Color,  // Include color
                    as: 'colors',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Color,  // Include color
                    as: 'size',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Color,  // Include color
                    as: 'scurbs',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Color,  // Include color
                    as: 'collection',
                    through: { attributes: [] },  // Exclude the join table attributes
                },
                {
                    model: db.Image,  // Include images
                    as: 'images',
                    attributes: ['url']  // Include only necessary attributes
                }
                // Add more relationships (like Size) if needed
            ],
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Create a new product and associate collections, categories, sizes, scrubs, images, and colors
export const createProduct = async (req, res) => {
    const { name, description, price, stock, categoryIds, colorIds, sizeIds, collectionIds, scrubIds, images } = req.body;

    try {
        // Create the product
        const newProduct = await db.Product.create({ name, description, price, stock });

        // Associate the product with categories
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.Category.findAll({ where: { id: categoryIds } });
            await newProduct.addCategories(categories);
        }

        // Associate the product with colors
        if (colorIds && colorIds.length > 0) {
            const colors = await db.Color.findAll({ where: { id: colorIds } });
            await newProduct.addColors(colors);
        }

        // Associate the product with sizes
        if (sizeIds && sizeIds.length > 0) {
            const sizes = await db.Size.findAll({ where: { id: sizeIds } });
            await newProduct.addSizes(sizes);
        }

        // Associate the product with collections
        if (collectionIds && collectionIds.length > 0) {
            const collections = await db.Collection.findAll({ where: { id: collectionIds } });
            await newProduct.addCollections(collections);
        }

        // Associate the product with scrubs
        if (scrubIds && scrubIds.length > 0) {
            const scrubs = await db.Scrub.findAll({ where: { id: scrubIds } });
            await newProduct.addScrubs(scrubs);
        }

        // Add images (assuming images are passed as an array of URLs)
        if (images && images.length > 0) {
            const imagePromises = images.map((imageUrl) => db.Image.create({ url: imageUrl, productId: newProduct.id }));
            await Promise.all(imagePromises);  // Create images and associate them with the product
        }

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a product and its collections, categories, sizes, scrubs, images, and colors
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, categoryIds, colorIds, sizeIds, collectionIds, scrubIds, images } = req.body;
    
    try {
        const product = await db.Product.findByPk(id, { include: db.Image });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update product attributes
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        await product.save();

        // Update the categories associated with the product
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.Category.findAll({ where: { id: categoryIds } });
            await product.setCategories(categories);  // Replaces existing associations
        }

        // Update the colors associated with the product
        if (colorIds && colorIds.length > 0) {
            const colors = await db.Color.findAll({ where: { id: colorIds } });
            await product.setColors(colors);  // Replaces existing associations
        }

        // Update the sizes associated with the product
        if (sizeIds && sizeIds.length > 0) {
            const sizes = await db.Size.findAll({ where: { id: sizeIds } });
            await product.setSizes(sizes);  // Replaces existing associations
        }

        // Update the collections associated with the product
        if (collectionIds && collectionIds.length > 0) {
            const collections = await db.Collection.findAll({ where: { id: collectionIds } });
            await product.setCollections(collections);  // Replaces existing associations
        }

        // Update the scrubs associated with the product
        if (scrubIds && scrubIds.length > 0) {
            const scrubs = await db.Scrub.findAll({ where: { id: scrubIds } });
            await product.setScrubs(scrubs);  // Replaces existing associations
        }

        // Handle image update logic
        if (images && images.length > 0) {
            // Delete old images from Cloudinary before uploading new ones
            const oldImages = await db.Image.findAll({ where: { productId: product.id } });

            // Loop through old images and delete from Cloudinary
            for (const oldImage of oldImages) {
                const currentImageUrl = oldImage.url;
                await cloudinary.uploader.destroy(getPublicIdFromUrl(currentImageUrl, { resource_type: 'image' }));
            }

            // Delete old images from the database
            await db.Image.destroy({ where: { productId: product.id } });

            // Upload new images and associate them with the product
            const imagePromises = images.map((imageUrl) => db.Image.create({ url: imageUrl, productId: product.id }));
            await Promise.all(imagePromises);  // Create images and associate them with the product
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Delete a product and its associations
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.Product.findByPk(id, { include: db.Image });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete associated images from Cloudinary and the database
        const images = await db.Image.findAll({ where: { productId: product.id } });
        for (const image of images) {
            const currentImageUrl = image.url;
            await cloudinary.uploader.destroy(getPublicIdFromUrl(currentImageUrl, { resource_type: 'image' }));  // Remove from Cloudinary
        }
        
        // Delete images from the database
        await db.Image.destroy({ where: { productId: product.id } });

        // Delete the product (and associated relationships)
        await product.destroy();

        res.status(204).send();  // No content
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
