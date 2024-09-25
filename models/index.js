import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import configFile from '../config/config.cjs'; // Adjust based on your config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

const db = {};

// Initialize Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Read and load models
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  });

  const models = await Promise.all(modelFiles.map(async (file) => {
    try {
      const modelPath = new URL(file, import.meta.url).href; // Use URL constructor
      const model = await import(modelPath);
      return model.default(sequelize, Sequelize.DataTypes);
    } catch (error) {
      console.error(`Error loading model ${file}:`, error);
      throw error; // Re-throw the error for further handling if needed
    }
  }));
  

models.forEach(model => {
  db[model.name] = model; // Store the model in the db object
});

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize and Sequelize to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
