import db from '../models/index.cjs';

// Get all collections with pagination
export const getAllCollections = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: collections, count: totalItems } = await db.Collection.findAndCountAll({
      limit,
      offset,
    });

    return {
      collections: collections.map(collection => collection.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

// Other CRUD operations for collections (Create, Update, Delete) can be similar to this
