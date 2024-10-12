import db from '../models/index.cjs'; // Adjust the import as per your project structure
import bcrypt from 'bcrypt';

// Fetch a user by ID along with their roles
export const fetchUserById = async (id) => {
  try {
    const user = await db.User.findByPk(id, {
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] } // Exclude join table attributes
      }
    });

    if (!user) throw new Error('User not found');
    
    // Convert Sequelize instance to plain JS object
    const plainUser = user.get({ plain: true });
    
    return plainUser;
  } catch (error) {
    throw error;
  }
};

// Fetch all users with pagination
// Fetch all users with pagination
export const fetchAllUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
  
    try {
      const { count, rows: users } = await db.User.findAndCountAll({
        attributes: { exclude: ['password'] }, // Exclude sensitive fields
        include: {
          model: db.Role,
          as: 'roles',
          attributes: ['id', 'role_name'],
          through: { attributes: [] }
        },
        limit,
        offset
      });
  
      // Convert each user instance to a plain object
      const plainUsers = users.map(user => user.get({ plain: true }));
  
      const totalPages = Math.ceil(count / limit);
  
      return { users: plainUsers, currentPage: page, totalPages, totalItems: count };
    } catch (error) {
      throw error;
    }
  };
  

// Create a new user
export const createNewUser = async ({ name, username, email, password, roleIds = [] }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = await db.Role.findOne({ where: { name: 'User' } });
    if (!userRole) throw new Error('Default role "User" not found');

    const newUser = await db.User.create({ name, username, email, password: hashedPassword });
    const allRoles = roleIds.length > 0 ? [userRole.id, ...roleIds] : [userRole.id];

    await newUser.setRoles(allRoles);

    const createdUser = await fetchUserById(newUser.id);
    return createdUser;
  } catch (error) {
    throw error;
  }
};

// Update a user and their roles
// Helper function to update user and their roles
export const updateUserAndRoles = async (id, { email, username, is_staff, is_admin }) => {
  try {
    // Fetch the user by ID
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('User not found');

    // Update user fields
    user.email = email || user.email;
    user.username = username || user.username;
    await user.save();

    // Fetch the role IDs for 'user', 'staff', and 'admin'
    const userRole = await db.Role.findOne({ where: { role_name: 'user' } });
    const adminRole = is_admin ? await db.Role.findOne({ where: { role_name: 'admin' } }) : null;
    const staffRole = is_staff ? await db.Role.findOne({ where: { role_name: 'staff' } }) : null;

    // Build the role array to include the 'user' role always
    const roleIds = [userRole.id];
    if (adminRole) roleIds.push(adminRole.id);
    if (staffRole) roleIds.push(staffRole.id);

    // Update user roles
    await user.setRoles(roleIds); // This updates the user's roles in the database

    // Return the updated user with roles
    const updatedUser = await db.User.findByPk(id, {
      include: {
        model: db.Role,
        as: 'roles',
        through: { attributes: [] } // Exclude join table attributes
      }
    });
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Delete a user by ID
export const deleteUserById = async (id) => {
  try {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('User not found');

    await user.destroy();
  } catch (error) {
    throw error;
  }
};
