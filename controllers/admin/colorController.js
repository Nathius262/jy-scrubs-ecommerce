import * as colorHelper from '../../helpers/colorHelper.js'

// Fetch all colors with pagination and render the colors page
export const getAllColors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { colors, totalItems, totalPages, currentPage } = await colorHelper.getAllColors(page, limit);

    res.render('./admin/color/list', {
      colors,
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
