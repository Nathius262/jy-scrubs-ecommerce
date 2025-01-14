// Get all products and render the product list
import * as productHelper from '../../helpers/productHelper.js';
import * as categoryHelper from '../../helpers/categoryHelper.js';
import * as colorHelper from '../../helpers/colorHelper.js';
import * as sizeHelper from '../../helpers/sizeHelper.js';
import * as scrubHelper from '../../helpers/scurbHelper.js';
import * as collectionHelper from '../../helpers/collectionHelper.js';


import db from '../../models/index.cjs';
import cloudinary from '../../config/cloudinary.js';
import { getPublicIdFromUrl } from '../../utils/utils.js';


// Render create product form with all the necessary data
export const renderCreateProductForm = async (req, res) => {
  try {
    const categories = await categoryHelper.getAllCategories();
    const colors = await colorHelper.getAllColors();
    const sizes = await sizeHelper.getAllSizes();
    const scrubs = await scrubHelper.getAllScurbs();
    const collections = await collectionHelper.getAllCollections();

    res.render('./admin/product/create', {
      categories: categories.categories, // Accessing plain objects
      colors: colors.colors,
      sizes: sizes.sizes,
      scrubs: scrubs.scrubs,
      collections: collections.collections,
      admin:true
    });
  } catch (error) {
    console.error('Error rendering create product form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Render update product form
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productHelper.getProductById(id);  // Fetch product by ID
    const categories = await categoryHelper.getAllCategories();
    const colors = await colorHelper.getAllColors();
    const sizes = await sizeHelper.getAllSizes();
    const scrubs = await scrubHelper.getAllScurbs();
    const collections = await collectionHelper.getAllCollections();

    // Create a Set of collection IDs associated with the product for fast lookup
    const productCollectionIds = new Set(product.collections.map(collection => collection.id));
    const productCategoryIds = new Set(product.categories.map(category => category.id));
    const productColorIds = new Set(product.colors.map(color => color.id));
    const productSizeIds = new Set(product.sizes.map(size => size.id));
    const productScurbIds = new Set(product.scrubs.map(scurb => scurb.id));

    res.render('./admin/product/update', {
      product,
      categories: categories.categories,
      colors: colors.colors,
      sizes: sizes.sizes,
      scrubs: scrubs.scrubs,
      collections: collections.collections,
      productCollectionIds,
      productCategoryIds,
      productColorIds,
      productSizeIds,
      productScurbIds,
      admin:true
    });
  } catch (error) {
    console.error('Error rendering update product form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Controller function to get all products with pagination and render the product list
export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page if not provided

  try {
    const { products, totalProductItems, totalProductPages, currentProductPage } = await productHelper.getAllProducts(page, limit);

    // Render the product list with pagination information
    res.render('./admin/product/list', {
      products,
      currentProductPage,
      totalProductPages,
      totalProductItems,
      limit,
      admin:true
    });
  } catch (error) {
    console.error('Error fetching products with pagination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Create a new product
export const createProduct = async (req, res) => {
  try {
    // Step 1: Extract product data from the request body
    const productData = req.body;

    // Step 2: Extract image URLs from the files uploaded to Cloudinary
    // Check if req.files exists and if it's an array
    if (req.files && Array.isArray(req.files)) {
      // Handle multiple files uploaded
      productData.images = req.files.map(file => file.path);  // Extract Cloudinary URLs
    } else if (req.file) {
      // Handle a single file uploaded (in case multer handles single file upload differently)
      productData.images = [req.file.path];  // Wrap it in an array for consistency
    } else {
      productData.images = [];  // No files uploaded
    }


    // Step 3: Call the helper to create the product with associated image URLs
    const newProduct = await productHelper.createProduct(productData);

    // Step 4: Send success response
    res.status(201).json({ message: "Product Created Successfully", redirectTo: "/admin/product" });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Call the updateProduct helper function
    const updatedProduct = await productHelper.updateProduct(productId, productData);

    // Redirect or send a response after successful update
    res.status(200).json({ message: 'Product updated successfully', redirectTo: `/admin/product/${productId}` });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await productHelper.deleteProduct(id);
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).json({ message: `Product ${id} deleted successfully`, redirectTo: "/admin/product" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadImages = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await db.Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle uploaded files from `req.files`
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imagePromises = files.map(file => {
      // You can upload to cloud storage here (e.g., Cloudinary) and get the URL back
      // const imageUrl = cloudinaryUploadFunction(file); // Example function
      return db.Image.create({
        url: file.path, // Or the cloud URL
        productId: product.id
      });
    });

    // Save the images in the database
    await Promise.all(imagePromises);

    // Fetch updated product images
    const updatedImages = await db.Image.findAll({ where: { productId } });

    res.status(200).json({ images: updatedImages });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'An error occurred while uploading images' });
  }
};

export const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the image in the database by its ID
    const image = await db.Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Extract public_id from the image URL using your helper function
    const publicId = getPublicIdFromUrl(image.url, { resource_type: 'image' });

    // Delete the image from Cloudinary using the extracted public ID
    const cloudinaryResult = await cloudinary.uploader.destroy(publicId);

    if (cloudinaryResult.result !== 'ok') {
      return res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
    }

    // Delete the image from the database
    await image.destroy();

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
