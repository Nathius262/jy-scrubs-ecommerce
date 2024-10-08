'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Scrub extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Scrub.belongsToMany(models.Product, {
        through: 'ProductScrub',    // Junction table
        foreignKey: 'scrubId',
        as: 'products'              // Alias for related products
      });
    }
  }
  Scrub.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Scrub',
  });
  return Scrub;
};