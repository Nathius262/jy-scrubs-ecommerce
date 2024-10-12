import * as collectionHelper from '../../helpers/collectionHelper.js'

// Fetch all collections with pagination and render the collections page
export const getAllCollections = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { collections, totalItems, totalPages, currentPage } = await collectionHelper.getAllCollections(page, limit);

    res.render('./admin/collection/list', {
      collections,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// You can similarly implement controllers for categories, colors, sizes, and scrubs
