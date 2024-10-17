import * as categoryHelper from '../../helpers/categoryHelper.js'

// Fetch all categories with pagination and render the categories page
export const getAllCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { categories, totalItems, totalPages, currentPage } = await categoryHelper.getAllCategories(page, limit);

    res.render('./admin/category/list', {
      categories,
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

// Controller to create a new category
export async function createCategoryController(req, res) {
  try {
    const { name, description } = req.body;


    // Call the helper to create the category
    const newCategory = await categoryHelper.createCategory({ name, description });
    
    // Return success response
    return res.status(201).json({ message: 'Category created successfully', category: newCategory, redirectTo:"/admin/category/create" });
  } catch (error) {
    // Log the detailed error to get more information
    console.error("Error in createCategoryController:", error);

    // Return a detailed error response
    return res.status(500).json({ message: 'Failed to create category', error: error.message || error });
  }
}

export const renderCategoryForm = async (req, res) => {
  try {
    res.render('./admin/category/create_category')
  } catch (error) {
    res.send(500).json("Internal server error", error)
  }
}