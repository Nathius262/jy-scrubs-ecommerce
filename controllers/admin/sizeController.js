import * as sizeHelper from '../../helpers/sizeHelper.js'

// Fetch all sizes with pagination and render the sizes page
export const getAllSize = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { sizes, totalItems, totalPages, currentPage } = await sizeHelper.getAllSizes(page, limit);

    res.render('./admin/size/list', {
      sizes,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching size:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
