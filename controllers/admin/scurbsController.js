import * as scrubsHelper from '../../helpers/scrubsHelper.js'

// Fetch all scurbs with pagination and render the scurbs page
export const getAllScurbs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { scurbs, totalItems, totalPages, currentPage } = await scrubsHelper.getAllScurbs(page, limit);

    res.render('./admin/collection/list', {
      scurbs,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching scurb:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
