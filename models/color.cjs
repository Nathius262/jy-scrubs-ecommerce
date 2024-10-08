'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Color.belongsToMany(models.Product, {
        through: 'ProductColor',   // Junction table
        foreignKey: 'colorId',
        as: 'products'             // Alias for related products
      });
    }
  }
  Color.init({
    name: DataTypes.STRING,
    hex_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Color',
  });
  return Color;
};