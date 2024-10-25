import * as colorHelper from '../../helpers/colorHelper.js'

// Fetch all colors with pagination and render the colors page
export const getAllColors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { colors, totalItems, totalPages, currentPage } = await colorHelper.getAllColors(page, limit);

    res.render('./admin/category/list_color', {
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
    const image_url = req.files?.['image_url'] ? req.files['image_url'][0].path : "";
    data.image_url = image_url
    
    const newColor = await colorHelper.createColor(data);
    return res.status(201).json({ message: 'Color created successfully', color: newColor, redirectTo:"/admin/color/create" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Failed to create color', error });
  }
}

export const updateColor = async (req, res) => {
  try {
    const colorId = req.params.id;
    const colorData = req.body;

    const image_url = req.files?.['image_url'] ? req.files['image_url'][0].path : "";
    colorData.image_url = image_url



    // Call the updateColor helper function
    const updatedcolor = await colorHelper.updateColor(colorId, colorData);

    // Redirect or send a response after successful update
    res.status(200).json({ message: 'Color updated successfully', redirectTo: `/admin/color/${colorId}` });

  } catch (error) {
    console.error('Error updating color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteColor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await colorHelper.deleteColor(id);
    if (!result) {
      return res.status(404).json({ error: 'Color not found' });
    }
    res.status(204).json({ message: `Color ${id} deleted successfully`, redirectTo: "/admin/color" });
  } catch (error) {
    console.error('Error deleting color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const renderColorForm = async (req, res) => {
  try {
    res.render('./admin/category/create_color')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}

export const renderColorUpdateForm = async (req, res) => {

  const id = req.params.id
  try {
    const color = await colorHelper.getColorById(id)
    res.render('./admin/category/update_color', {color})
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}