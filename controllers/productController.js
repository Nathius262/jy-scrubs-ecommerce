// Get all products and render the product list
import * as productHelper from '../helpers/productHelper.js';
import * as productFilterHelper from '../helpers/productFilterHelper.js';
import * as categoryHelper from '../helpers/categoryHelper.js';
import * as colorHelper from '../helpers/colorHelper.js';
import * as sizeHelper from '../helpers/sizeHelper.js';
import * as scrubHelper from '../helpers/scurbHelper.js';
import * as collectionHelper from '../helpers/collectionHelper.js';


// Render update product form
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await productHelper.getProductBySlug(slug);  // Fetch product by ID
    const categories = await categoryHelper.getAllCategories();
    const colors = await colorHelper.getAllColors();
    const sizes = await sizeHelper.getAllSizes();
    const scrubs = await scrubHelper.getAllScurbs();
    const collections = await collectionHelper.getAllCollections();

    // Create a Set of collection IDs associated with the product for fast lookup
    const productCollectionIds = new Set(product.collections.map(collection => collection.id));
    const productCategoryIds = new Set(product.categories.map(category => category.id));
    const productColorIds = new Set(product.colors.map(color => {color.id, color.name}));
    const productSizeIds = new Set(product.sizes.map(size => size.id));
    const productScurbIds = new Set(product.scrubs.map(scurb => {scurb.id}));
    

    res.render('./product/single', {
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
      productScurbIds
    });
  } catch (error) {
    console.error('Error rendering update product form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to get all products with pagination and render the product list
export const getAllProducts = async (req, res) => {
  const filters = {
    category: req.query.category || 'men',  // Optional category filter
    color: req.query.color || null,        // Optional color filter
    size: req.query.size || null,          // Optional size filter
    scrub: req.query.scrub || null,        // Optional scrub filter
    collection: req.query.collection || null,  // Optional collection filter
  };
  const page = parseInt(req.query.page) || 1;  // Default to page 1
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 products per page

  try {
    const filteredData = await productFilterHelper.getMultipleFilteredProducts(filters, page, limit);

    // Render the page with filtered products, available filters, and pagination info
    return res.render('./product/product', {
      products: filteredData.products,
      colors: filteredData.colors,
      sizes: filteredData.sizes,
      collections: filteredData.collections,
      scrubs: filteredData.scrubs,
      selectedCategory: filters.category,
      currentProductPage: filteredData.currentProductPage,
      totalProductPages: filteredData.totalProductPages,
      totalProductItems: filteredData.totalProductItems,
    });
  } catch (error) {
    console.error('Error loading filtered products:', error);
    res.status(500).send('Error loading products');
  }
};
