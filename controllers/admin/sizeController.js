import * as sizeHelper from '../../helpers/sizeHelper.js'

// Fetch all sizes with pagination and render the sizes page
export const getAllSize = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { sizes, totalItems, totalPages, currentPage } = await sizeHelper.getAllSizes(page, limit);

    res.render('./admin/size/list', {
      sizes,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching size:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to create a new size
export async function createSizeController(req, res) {
  try {
    const data = req.body;
    const newSize = await sizeHelper.createSize(data);
    return res.status(201).json({ message: 'Size created successfully', size: newSize, redirectTo:"/admin/size/create"});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Failed to create size', error });
  }
}

export const renderSizeForm = async (req, res) => {
  try {
    res.render('./admin/category/create_size')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}