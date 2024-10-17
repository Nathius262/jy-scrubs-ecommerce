import db from '../models/index.cjs';

// Create a new scrub
export async function createScrub(data) {
  return await db.Scrub.create(data);
}

export const getAllScurbs = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit; // Calculate offset for pagination
  try {
    const { count, rows: allScrubs } = await db.Scrub.findAndCountAll({
      limit,     // Number of records to return
      offset     // Offset for pagination
    });


    const scrubs = allScrubs.map(scurb => scurb.get({ plain: true }));

    return {
      scrubs,
      currentPage: page,
      totalPages: Math.ceil(count / limit),   // Total number of pages
      totalItems: count                      // Total number of roles
    };
  } catch (error) {
    throw new Error(`Error fetching scurbs: ${error.message}`);
  }
};