import * as categoryHelper from '../../helpers/categoryHelper.js'

// Fetch all categories with pagination and render the categories page
export const getAllCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { categories, totalItems, totalPages, currentPage } = await categoryHelper.getAllCategories(page, limit);

    res.render('./admin/category/list', {
      categories,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
