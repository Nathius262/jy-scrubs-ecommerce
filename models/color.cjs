'use strict';
const { Model } = require('sequelize');
const generateUniqueSlug = require('../helpers/slugHelper.cjs'); // Import the slug helper function

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
    hex_code: DataTypes.STRING,
    image_url: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true,  // Ensures the slug is unique
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Color',
  });

  Color.beforeValidate(async (category) => {
    if (!category.slug) {
      category.slug = await generateUniqueSlug(category.name, Color);
    }
  });

  Color.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      product.slug = await generateUniqueSlug(product.name, Color);
    }
  });

  return Color;
};