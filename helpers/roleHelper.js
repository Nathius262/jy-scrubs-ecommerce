import db from '../models/index.cjs';  // Adjust the path if needed

// Fetch all roles with pagination
export const fetchAllRoles = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit; // Calculate offset for pagination
  try {
    const { count, rows: roles } = await db.Role.findAndCountAll({
      limit,     // Number of records to return
      offset     // Offset for pagination
    });

    const plainRoles = roles.map(user => user.get({ plain: true }));

    return {
      plainRoles,
      currentPage: page,
      totalPages: Math.ceil(count / limit),   // Total number of pages
      totalItems: count                      // Total number of roles
    };
  } catch (error) {
    throw new Error(`Error fetching roles: ${error.message}`);
  }
};

// Fetch a specific role by ID
export const fetchRoleById = async (id) => {
  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }
    const plainRole = role.get({ plain: true });

    return plainRole;
  } catch (error) {
    throw new Error(`Error fetching role by ID: ${error.message}`);
  }
};

// Create a new role
export const createNewRole = async (name) => {
  try {
    const newRole = await db.Role.create({ role_name: name });
    return newRole;
  } catch (error) {
    throw new Error(`Error creating role: ${error.message}`);
  }
};

// Update a role by ID
export const updateRoleById = async (id, name) => {
  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }
    role.role_name = name || role.role_name;
    await role.save();
    return role;
  } catch (error) {
    throw new Error(`Error updating role: ${error.message}`);
  }
};

// Delete a role by ID
export const deleteRoleById = async (id) => {
  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      throw new Error('Role not found');
    }
    await role.destroy();
    return true;
  } catch (error) {
    throw new Error(`Error deleting role: ${error.message}`);
  }
};
