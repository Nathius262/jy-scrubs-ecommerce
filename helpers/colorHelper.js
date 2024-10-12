import db from '../models/index.cjs';

export const getAllColors = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: colors, count: totalItems } = await db.Color.findAndCountAll({
      limit,
      offset,
    });

    return {
      colors: colors.map(color => color.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};
