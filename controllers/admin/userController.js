import { fetchUserById, fetchAllUsers, createNewUser, updateUserAndRoles, deleteUserById } from '../../helpers/userHelper.js';

// Get all users (Admin HTML rendering)
export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const data = await fetchAllUsers(page, limit);
    res.render('./admin/user/list', { users: data.users, pagination: { currentPage: data.currentPage, totalPages: data.totalPages, totalItems: data.totalItems } });
  } catch (error) {
    res.status(500).render('errorPage', { error: error.message });
  }
};

// Get a user by ID (Admin HTML rendering)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await fetchUserById(id); // Assuming fetchUserById is a helper function
    if (!user) {
      return res.status(404).render('errorPage', { message: 'User not found' });
    }
    res.render('./admin/user/update', { user });
  } catch (error) {
    res.status(500).render('errorPage', { message: 'Internal server error' });
  }
};


// Create a new user (Admin HTML rendering)
export const createUser = async (req, res) => {
  try {
    const newUser = await createNewUser(req.body);
    res.redirect('/admin/user'); // Redirect to user list
  } catch (error) {
    res.status(500).render('errorPage', { error: error.message });
  }
};

// Update a user (Admin HTML rendering)
// Controller for updating a user and their roles
export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { email, username, is_staff, is_admin } = req.body;

  try {
    // Update the user and their roles
    const updatedUser = await updateUserAndRoles(id, { email, username, is_staff, is_admin });

    // Redirect to the user edit page after updating
    return res.json({redirectTo:`/admin/user/${id}`});
  } catch (error) {
    return res.status(500).render('errorPage', { message: 'Internal server error' });
  }
};

// Delete a user (Admin HTML rendering)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteUserById(id);
    res.redirect('/admin/user'); // Redirect to user list after deletion
  } catch (error) {
    res.status(500).render('errorPage', { error: error.message });
  }
};
