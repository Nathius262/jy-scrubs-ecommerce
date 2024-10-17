import * as scrubsHelper from '../../helpers/scurbHelper.js'

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

// Controller to create a new scrub
export async function createScrubController(req, res) {
  try {
    const data = req.body;
    const newScrub = await scrubsHelper.createScrub(data);
    return res.status(201).json({ message: 'Scrub created successfully', scrub: newScrub, redirectTo:"/admin/scurb/create" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Failed to create scrub', error });
  }
}

export const renderScurbForm = async (req, res) => {
  try {
    res.render('./admin/category/create_scurb')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}