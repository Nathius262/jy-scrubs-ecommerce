'use strict';
const { Model } = require('sequelize');
const generateUniqueSlug = require('../helpers/slugHelper.cjs'); // Import the slug helper function

module.exports = (sequelize, DataTypes) => {
  class Size extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Size.belongsToMany(models.Product, {
        through: 'ProductSize',   // Junction table
        foreignKey: 'sizeId',
        as: 'products'            // Alias for related products
      });
    }
  }
  Size.init({
    name: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true,  // Ensures the slug is unique
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Size',
  });
  Size.beforeValidate(async (category) => {
    if (!category.slug) {
      category.slug = await generateUniqueSlug(category.name, Size);
    }
  });

  Size.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      product.slug = await generateUniqueSlug(product.name, Size);
    }
  });
  return Size;
};