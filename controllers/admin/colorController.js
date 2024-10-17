import * as colorHelper from '../../helpers/colorHelper.js'

// Fetch all colors with pagination and render the colors page
export const getAllColors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { colors, totalItems, totalPages, currentPage } = await colorHelper.getAllColors(page, limit);

    res.render('./admin/color/list', {
      colors,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to create a new color
export async function createColorController(req, res) {
  try {
    const data = req.body;
    const newColor = await colorHelper.createColor(data);
    return res.status(201).json({ message: 'Color created successfully', color: newColor, redirectTo:"/admin/color/create" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Failed to create color', error });
  }
}

export const renderColorForm = async (req, res) => {
  try {
    res.render('./admin/category/create_color')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}