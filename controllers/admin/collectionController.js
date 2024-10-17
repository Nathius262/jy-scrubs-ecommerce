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

// Controller to create a new collection
export async function createCollectionController(req, res) {
  try {
    const data = req.body;
    const newCollection = await collectionHelper.createCollection(data);
    return res.status(201).json({ message: 'Collection created successfully', collection: newCollection, redirectTo:"/admin/collection/create" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Failed to create collection', error });
  }
}


export const renderCollectionForm = async (req, res) => {
  try {
    res.render('./admin/category/create_collection')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}