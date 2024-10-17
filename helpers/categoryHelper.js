import db from '../models/index.cjs';

export const getAllCategories = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: categories, count: totalItems } = await db.Category.findAndCountAll({
      limit,
      offset,
    });

    return {
      categories: categories.map(category => category.get({ plain: true })),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

// Create a new category
export async function createCategory({name, description}) {
  console.log({name, description})
  return await db.Category.create({name, description});
}