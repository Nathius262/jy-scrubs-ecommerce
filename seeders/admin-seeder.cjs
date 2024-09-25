'use strict';
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { exec } = require('child_process'); // Import child_process to run shell commands

dotenv.config();

const DEFAULT_PASSWORD = process.env.USER_ADMIN_PASSWORD;

// Helper to check if the Roles table exists
async function doesTableExist(queryInterface, tableName) {
  const tableExists = await queryInterface.sequelize.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`
  );
  return tableExists[0].length > 0;
}

// Function to run migrations
async function runMigrations() {
  return new Promise((resolve, reject) => {
    // Execute the shell command to run migrations
    exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${stderr}`);
        return reject(error);
      }
      console.log(`Migration output: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function seedAdmin(queryInterface, Sequelize) {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  try {
    // Check if the "Roles" table exists
    const rolesTableExists = await doesTableExist(queryInterface, 'Roles');

    if (!rolesTableExists) {
      console.log("Roles table does not exist. Running migrations...");
      await runMigrations(); // Run migrations if table doesn't exist
    }

    // Insert roles if they don't exist
    await queryInterface.bulkInsert('Roles', [
      { roleName: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { roleName: 'staff', createdAt: new Date(), updatedAt: new Date() },
      { roleName: 'user', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Fetch the roles from the database after insertion
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, roleName FROM "Roles" WHERE roleName IN ('admin', 'staff', 'user')`
    );

    // Check if the admin user exists
    const existingAdminUser = await queryInterface.sequelize.query(
      `SELECT * FROM "Users" WHERE "email" = '${process.env.USER_ADMIN_EMAIL}'`
    );

    if (existingAdminUser[0].length === 0) {
      // Insert admin user if it doesn't exist
      await queryInterface.bulkInsert('Users', [{
        name: process.env.USER_ADMIN_NAME,
        username: process.env.USER_ADMIN_USERNAME,
        email: process.env.USER_ADMIN_EMAIL,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

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

      await queryInterface.bulkInsert('UserRole', userRoles, {});
      console.log('Admin user and roles successfully created.');
    } else {
      console.log('Admin user already exists. Skipping user creation.');
    }

  } catch (error) {
    console.error('Error while seeding admin user:', error);
  }
}

module.exports = {
  seedAdmin
};
