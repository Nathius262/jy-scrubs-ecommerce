import * as productHelper from '../helpers/productHelper.js';


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
      const filteredData = await productHelper.getMultipleFilteredProducts(filters, page, limit);
  
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
  