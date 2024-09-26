import db from '../../models/index.cjs';

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a role by ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new role
export const createRole = async (req, res) => {
  const { name } = req.body;
  try {
    const newRole = await db.Role.create({ name });
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a role
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    role.name = name || role.name;
    await role.save();

    res.status(200).json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a role
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await db.Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    await role.destroy();
    res.status(204).send();  // No content
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

