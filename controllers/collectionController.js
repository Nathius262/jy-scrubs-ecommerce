import * as productFilterHelper from '../helpers/productFilterHelper.js';


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

export const getFilteredProductsBySlug = async (req, res) => {
  try {
    const { category, slug } = req.params; // Get category and slug from URL
    const { page = 1, limit = 10 } = req.query; // Pagination from query string

    // Call the helper function with the URL parameters
    const filteredData = await productFilterHelper.getFilteredProductsBySlug(category, slug, parseInt(page), parseInt(limit));

    // Render the template with the filtered data
    return res.render('./collection/product', { 
      products: filteredData.products,
      colors: filteredData.colors,
      sizes: filteredData.sizes,
      collections: filteredData.collections,
      scrubs: filteredData.scrubs,
      selectedCategory: category,
      title:category,
      currentProductPage: filteredData.currentProductPage,
      totalProductPages: filteredData.totalProductPages,
      totalProductItems: filteredData.totalProductItems,
    });
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).render('error', { error: 'Failed to fetch products' });
  }
};
