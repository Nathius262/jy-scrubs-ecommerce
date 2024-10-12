import db from '../models/index.cjs';

export const getAllSizes = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: sizes, count: totalItems } = await db.Size.findAndCountAll({
      limit,
      offset,
    });

    return {
      sizes: sizes.map(category => category.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};
