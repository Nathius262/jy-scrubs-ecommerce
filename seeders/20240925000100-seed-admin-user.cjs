'use strict';
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_PASSWORD = process.env.USER_ADMIN_PASSWORD; // Admin password from env variables

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    try {
      // Insert roles: admin, staff, user
      const newRoles = await queryInterface.bulkInsert('Roles', [
        { roleName: 'admin', createdAt: new Date(), updatedAt: new Date() },
        { roleName: 'staff', createdAt: new Date(), updatedAt: new Date() },
        { roleName: 'user', createdAt: new Date(), updatedAt: new Date() }
      ]);

      console.log(newRoles)

      // Fetch the roles from the database after insertion
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id, roleName FROM "Roles" WHERE roleName IN ('admin', 'staff', 'user')`
      );

      // Create the admin user with the hashed password
      const newUser = await queryInterface.bulkInsert('Users', [{
        name: process.env.USER_ADMIN_NAME,           // Admin name from env
        username: process.env.USER_ADMIN_USERNAME,   // Admin username from env
        email: process.env.USER_ADMIN_EMAIL,         // Admin email from env
        password: hashedPassword,                    // Hashed password
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      console.log(newUser)

      // Get the newly created user
      const [adminUser] = await queryInterface.sequelize.query(
        `SELECT * FROM "Users" WHERE "email" = '${process.env.USER_ADMIN_EMAIL}'`
      );

      // Associate the admin user with all roles in the UserRole table
      const userRoles = roles.map(role => ({
        userId: adminUser[0].id,
        roleId: role.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Insert the role associations for the admin user
      await queryInterface.bulkInsert('UserRole', userRoles, {});
    } catch (error) {
      console.log("custom error", error.errors)
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the user-role associations
    await queryInterface.bulkDelete('UserRole', {
      userId: {
        [Sequelize.Op.eq]: (await queryInterface.sequelize.query(
          `SELECT id FROM "Users" WHERE "email" = '${process.env.USER_ADMIN_EMAIL}'`
        ))[0][0].id // Ensuring we fetch the user ID based on the email
      }
    }, {});

    // Remove the admin user
    await queryInterface.bulkDelete('Users', {
      email: process.env.USER_ADMIN_EMAIL // Ensures only the admin user created here is deleted
    }, {});

    // Remove the roles
    await queryInterface.bulkDelete('Roles', {
      name: { [Sequelize.Op.in]: ['admin', 'staff', 'user'] }
    }, {});
  }
};
