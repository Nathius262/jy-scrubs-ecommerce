import db from '../models/index.cjs';

export const getAllScurbs = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: scurbs, count: totalItems } = await db.Scurb.findAndCountAll({
      limit,
      offset,
    });

    return {
      scurbs: scurbs.map(category => category.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};
