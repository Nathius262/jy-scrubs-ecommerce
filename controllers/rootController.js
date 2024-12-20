import {getFilteredProducts} from '../helpers/productFilterHelper.js';


export const index_view = async (req, res) => {
  const category = req.query.category || 'men'; // Default to 'men' category if not specified
  const page = parseInt(req.query.page) || 1;  // Default to page 1
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 products per page

  try {
    const filteredData = await getFilteredProducts(category, page, limit);
    //console.log(filteredData)

    // Render the page with filtered products, available filters, and pagination info
    return res.render('./layouts/index', {
      products: filteredData.products,
      colors: filteredData.colors,
      sizes: filteredData.sizes,
      collections: filteredData.collections,
      scrubs: filteredData.scrubs,
      selectedCategory: category,
      currentProductPage: filteredData.currentProductPage,
      totalProductPages: filteredData.totalProductPages,
      totalProductItems: filteredData.totalProductItems,
    });
  } catch (error) {
    console.error('Error loading filtered products:', error);
    res.status(500).send('Error loading products');
  }
};

export const about_view = async (req, res) => {
  try {
    res.render('./others/about');
  } catch (error) {
    res.status(500).send('Error loading page', error);
  }
}

export const privacy_policy_view = async (req, res) => {
  try {
    res.render('./others/privacy_policy');
  } catch (error) {
    res.status(500).send('Error loading page', error);
  }
}

export const contact_view = async (req, res) => {
  try {
    res.render('./others/contact');
  } catch (error) {
    res.status(500).send('Error loading page', error);
  }
}

export const terms_conditions_view = async (req, res) => {
  try {
    res.render('./others/terms_conditions');
  } catch (error) {
    res.status(500).send('Error loading page', error);
  }
}