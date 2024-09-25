module.exports = {
  development: {
    username: null, // SQLite doesn't require a username
    password: null, // SQLite doesn't require a password
    database: 'db.sqlite', // SQLite file name
    storage: './db.sqlite', // Path to SQLite file
    dialect: 'sqlite'
  },
  test: {
    username: null,
    password: null,
    database: 'db_test.sqlite',
    storage: './db_test.sqlite', // SQLite file path for testing
    dialect: 'sqlite'
  },
  production: {
    username: 'root', // Replace with your PostgreSQL username
    password: null,   // Replace with your PostgreSQL password
    database: 'database_production',
    host: '127.0.0.1', // Replace with your PostgreSQL host
    dialect: 'postgres',
    logging: false    // Disable logging in production for performance
  }
};
