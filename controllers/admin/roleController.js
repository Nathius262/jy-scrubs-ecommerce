import {
  fetchAllRoles,
  fetchRoleById,
  createNewRole,
  updateRoleById,
  deleteRoleById,
} from '../../helpers/roleHelper.js';  // Adjust the path if needed

// Get all roles with pagination
export const getAllRoles = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;    // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page

  try {
    const result = await fetchAllRoles(page, limit);
    res.status(200).render('./admin/role/list', {
      roles: result.plainRoles,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      admin:true
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a role by ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await fetchRoleById(id);
    res.status(200).render('./admin/role/update', {role:role, admin:true});
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new role
export const createRole = async (req, res) => {
  const { role_name } = req.body;
  try {
    const newRole = await createNewRole(role_name);
    res.status(201).json({message:"Created Successfully", redirectTo:"/admin/role"});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a role
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { role_name } = req.body;

  try {
    const updatedRole = await updateRoleById(id, role_name);
    res.status(200).json(updatedRole , {message:"Updated Successfully", redirectTo:`/admin/role/${id}`});
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const renderRoleForm = async (req, res) => {
  try {
    res.render('./admin/role/create', {admin:true})
  } catch (error) {
    res.send(404).json("not found")
  }
}

// Delete a role
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await deleteRoleById(id);
    if (success) {
      res.status(204).json({redirectTo:"/admin/role", message:`Role id "${id}" deleted`});  // No content
    }
  } catch (error) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
