import db from '../models/index.cjs';
import cloudinary from '../config/cloudinary.js';
import { getPublicIdFromUrl } from '../utils/utils.js';


// Helper function to fetch all products with pagination
export const getAllProducts = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;  // Calculate offset for pagination

        // Fetch products with their relationships, and apply pagination
        const { rows: products, count: totalProductItems } = await db.Product.findAndCountAll({
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
            totalProductItems,
            totalProductPages: Math.ceil(totalProductItems / limit),
            currentProductPage: page,
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
                { model: db.Image, as: 'images', attributes: ['url', 'id', 'is_primary'] },
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
        // Step 1: Create the product
        const newProduct = await db.Product.create({ name, description, price, stock });

        // Step 2: Handle many-to-many relationships (categories, colors, sizes, collections, scrubs)
        if (categoryIds && categoryIds.length > 0) {
            const categories = await db.Category.findAll({ where: { id: categoryIds } });
            await newProduct.addCategories(categories);
        }
        if (colorIds && colorIds.length > 0) {
            const colors = await db.Color.findAll({ where: { id: colorIds } });
            await newProduct.addColors(colors);
        }
        if (sizeIds && sizeIds.length > 0) {
            const sizes = await db.Size.findAll({ where: { id: sizeIds } });
            await newProduct.addSizes(sizes);
        }
        if (collectionIds && collectionIds.length > 0) {
            const collections = await db.Collection.findAll({ where: { id: collectionIds } });
            await newProduct.addCollections(collections);
        }
        if (scrubIds && scrubIds.length > 0) {
            const scrubs = await db.Scrub.findAll({ where: { id: scrubIds } });
            await newProduct.addScrubs(scrubs);
        }

        // Step 3: Handle multiple image uploads
        if (images && images.length > 0) {
            // Each image gets saved with the newly created product's ID as the foreign key
            const imagePromises = images.map(imageUrl => db.Image.create({ url: imageUrl, productId: newProduct.id }));
            await Promise.all(imagePromises);
        }

        // Step 4: Return the created product
        return newProduct.get({ plain: true });
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (productId, productData) => {
    const {
      name,
      description,
      price,
      stock,
      categoryIds = [],
      colorIds = [],
      sizeIds = [],
      collectionIds = [],
      scrubIds = [],
      primaryImageId
    } = productData;
  
    // Convert string IDs to arrays if they're not already arrays
    const toArray = (val) => (Array.isArray(val) ? val : [val]);
  
    // Safely convert strings to arrays and then to integers
    const parsedCategoryIds = toArray(categoryIds).map(id => parseInt(id, 10));
    const parsedColorIds = toArray(colorIds).map(id => parseInt(id, 10));
    const parsedSizeIds = toArray(sizeIds).map(id => parseInt(id, 10));
    const parsedCollectionIds = toArray(collectionIds).map(id => parseInt(id, 10));
    const parsedScrubIds = toArray(scrubIds).map(id => parseInt(id, 10));
  
    const transactionOptions = {
        retry: {
          max: 5, // Number of retries before throwing an error
          match: [
            'SQLITE_BUSY' // Retry only if database is locked
          ],
          backoffBase: 1000, // Initial retry delay
          backoffExponent: 1.1 // Exponential backoff for retry delays
        }
      };
    
      const transaction = await db.sequelize.transaction(transactionOptions);
    
    
    try {
      // Fetch the product to be updated
      const product = await db.Product.findByPk(productId);
    
      if (!product) {
        throw new Error('Product not found');
      }
  
      // Update product basic details
      await product.update({ name, description, price, stock }, { transaction });
  
      // Handle many-to-many relationships with proper logging and error handling
      if (parsedCategoryIds.length >= 0) {
        const categories = await db.Category.findAll({ where: { id: parsedCategoryIds } });
        await product.setCategories(categories, { transaction });
      }
  
      if (parsedColorIds.length >= 0) {
        const colors = await db.Color.findAll({ where: { id: parsedColorIds } });
        await product.setColors(colors, { transaction });
      }
  
      if (parsedSizeIds.length >= 0) {
        const sizes = await db.Size.findAll({ where: { id: parsedSizeIds } });
        await product.setSizes(sizes, { transaction });
      }
  
      if (parsedCollectionIds.length >= 0) {
        const collections = await db.Collection.findAll({ where: { id: parsedCollectionIds } });
        await product.setCollections(collections, { transaction });
      }
  
      if (parsedScrubIds.length >= 0) {
        const scrubs = await db.Scrub.findAll({ where: { id: parsedScrubIds } });
        await product.setScrubs(scrubs, { transaction });
      }

      // Handle primary image selection
      if (primaryImageId) {
        await db.Image.update({ is_primary: false }, { where: { productId: product.id }, transaction });
        await db.Image.update({ is_primary: true }, { where: { id: parseInt(primaryImageId, 10) }, transaction });
      }
  
      // Commit the transaction if all operations were successful
      await transaction.commit();
  
      return product.get({ plain: true });
    
    } catch (error) {
      console.error('Error updating product:', error);
      await transaction.rollback();
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

// helpers/productHelper.js

export const getFilteredProducts = async (category) => {
    try {
      const categoryId = category;
      console.log(categoryId);
  
      // Fetch products filtered by the category
      const products = await db.Product.findAll({
        include: [
          {
            model: db.Category,
            as: 'categories',
            through: { attributes: [] },
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
        ]
      });
      
      const mappedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        
        // Flatten the categories array
        categories: product.categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
      
        // Flatten the images array
        images: product.images.map(image => ({
          id: image.id,
          url: image.url,
          alt_text: image.alt_text,
          is_primary: image.is_primary,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
          productId: image.productId,
        })),
      
        // Flatten the colors array
        colors: product.colors.map(color => ({
          id: color.id,
          name: color.name,
          hex_code: color.hex_code,
          createdAt: color.createdAt,
          updatedAt: color.updatedAt,
        })),
      }));
      
      console.log('mappedProducts', mappedProducts);
      
      
  
      // Fetch all available filters (colors, sizes, collections, scrubs) without filtering by category
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
                where: { name: categoryId },
              },
              {
                model: db.Image,
                as: 'images',
                where: { is_primary: true },
                required: false, // Ensure that it still fetches products even without images
              },
            ],
          },
        ],
      });
      
      
  
      const scrubs = await db.Scrub.findAll();
  
      return {
        products: mappedProducts,
        colors: colors.map(product => product.get({ plain: true })),
        sizes: sizes.map(product => product.get({ plain: true })),
        collections: collections.map(product => product.get({ plain: true })),
        scrubs: scrubs.map(product => product.get({ plain: true })),
      };
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
  };
  