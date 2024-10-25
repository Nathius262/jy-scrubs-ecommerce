import db from '../models/index.cjs';
import cloudinary from '../config/cloudinary.js';
import { getPublicIdFromUrl } from '../utils/utils.js';


// Helper function to fetch all products with pagination
export const getAllProducts = async (page, limit) => {
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
            distinct: true,
            order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
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
          where: { name: categoryId },  // Filter by category name
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
      limit, // Limit the number of products per page
      offset, // Offset to skip products for pagination
      distinct: true,  // Ensure unique products are counted
    });

    // Map the products to the desired format
    const mappedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
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
              where: { name: categoryId },
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
      categoryWhere.name = category;  // Filter by category name
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

export const getProductCart = async (cartData) => {
    try {
        const products = await Promise.all(cartData.map(async (item) => {
            const product = await db.Product.findByPk(item.productId, {
                include: [
                    { model: db.Color, as: 'colors', through: { attributes: [] } },
                    { model: db.Size, as: 'sizes', through: { attributes: [] } },
                    { model: db.Image, as: 'images', required: false, limit: 1 },
                ],
            });
            if (!product) return null;

            // Get the product with the plain object
            const plainProduct = product.get({ plain: true });

            // Match the color and size with their respective IDs
            const matchedColor = plainProduct.colors.find(color => color.id == item.colorId);
            const matchedSize = plainProduct.sizes.find(size => size.id == item.sizeId);

            return {
                ...plainProduct,
                quantity: item.quantity,
                selectedColor: matchedColor,
                selectedSize: matchedSize,
            };
        }));

        return products.filter(product => product !== null); // Filter out any null products
    } catch (error) {
        throw error;
    }
};
