// Get all products and render the product list
import * as productHelper from '../../helpers/productHelper.js';
import * as categoryHelper from '../../helpers/categoryHelper.js';
import * as colorHelper from '../../helpers/colorHelper.js';
import * as sizeHelper from '../../helpers/sizeHelper.js';
import * as scrubHelper from '../../helpers/scurbHelper.js';
import * as collectionHelper from '../../helpers/collectionHelper.js';

// Render create product form with all the necessary data
export const renderCreateProductForm = async (req, res) => {
  try {
    const categories = await categoryHelper.getAllCategories();
    const colors = await colorHelper.getAllColors();
    const sizes = await sizeHelper.getAllSizes();
    const scrubs = await scrubHelper.getAllScrubs();
    const collections = await collectionHelper.getAllCollections();

    res.render('./admin/product/create', {
      categories: categories.categories, // Accessing plain objects
      colors: colors.colors,
      sizes: sizes.sizes,
      scrubs: scrubs.scrubs,
      collections: collections.collections,
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
    const scrubs = await scrubHelper.getAllScrubs();
    const collections = await collectionHelper.getAllCollections();

    res.render('./admin/product/update', {
      product,
      categories: categories.categories,
      colors: colors.colors,
      sizes: sizes.sizes,
      scrubs: scrubs.scrubs,
      collections: collections.collections,
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
        const { products, totalItems, totalPages, currentPage } = await productHelper.getAllProducts(page, limit);

        // Render the product list with pagination information
        res.render('./admin/product/list', {
            products,
            currentPage,
            totalPages,
            totalItems,
            limit,
        });
    } catch (error) {
        console.error('Error fetching products with pagination:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Create a new product
export const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await productHelper.createProduct(productData);
        res.status(201).json({message:"Product Created Successfully", redirectTo:"/admin/product"});
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Update a product by ID
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    try {
        const updatedProduct = await productHelper.updateProduct(id, productData);
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({message:"Product Updated Successfully", redirectTo:`/admin/product/${id}`});
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
        res.status(204).json({message:`Product ${id} deleted successfully`, redirectTo:"/admin/product"});
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
