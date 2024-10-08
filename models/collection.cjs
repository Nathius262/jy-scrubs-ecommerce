'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Collection.belongsToMany(models.Product, {
        through: 'ProductCollection',  // Junction table
        foreignKey: 'collectionId',
        as: 'products'                 // Alias for related products
      });
    }
  }
  Collection.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collection',
  });
  return Collection;
};