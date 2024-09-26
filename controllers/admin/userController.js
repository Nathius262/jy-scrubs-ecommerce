import db from '../../models/index.cjs'; // Adjust the path as necessary
import bcrypt from 'bcrypt';

// Get all users with their roles
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    })
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a unique user by ID with their roles
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.User.findByPk(id, {
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user with the default role of 'User'
export const createUser = async (req, res) => {
  const { name, username, email, password, roleIds } = req.body; // Expecting an array of roleIds
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Find the default 'User' role by its name (or ID, if you prefer using IDs)
    const userRole = await db.Role.findOne({ where: { name: 'User' } });
    
    if (!userRole) {
      return res.status(500).json({ error: 'Default role "User" not found in the system' });
    }

    // Create the user
    const newUser = await db.User.create({ name, username, email, password: hashedPassword });

    // Combine the 'User' role with any roles provided in the request
    const allRoles = roleIds && roleIds.length > 0 ? [userRole.id, ...roleIds] : [userRole.id];

    // Associate roles with the newly created user
    await newUser.setRoles(allRoles); // `setRoles` to link the user with the roles

    // Fetch the user with associated roles for response
    const userWithRoles = await db.User.findByPk(newUser.id, {
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    });

    res.status(201).json(userWithRoles);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user and their roles
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, roleIds } = req.body; // Include roleIds in the request
  
  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    // Update user roles if provided
    if (roleIds && roleIds.length > 0) {
      await user.setRoles(roleIds); // Update roles association
    }

    // Fetch the updated user with their roles
    const updatedUser = await db.User.findByPk(id, {
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] }
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
