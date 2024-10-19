import {getFilteredProducts} from '../helpers/productHelper.js';


export const index_view = async (req, res) => {
    const category = req.query.category || 'men'; // Default to 'men' category if not specified

  try {
    const filteredData = await getFilteredProducts(category);


    // Render the page with filtered products and available filters
    return res.render('./layouts/index', {
      products: filteredData.products,
      colors: filteredData.colors,
      sizes: filteredData.sizes,
      collections: filteredData.collections,
      scrubs: filteredData.scrubs,
      selectedCategory: category,
    });
  } catch (error) {
    console.error('Error loading filtered products:', error);
    res.status(500).send('Error loading products');
  }
}