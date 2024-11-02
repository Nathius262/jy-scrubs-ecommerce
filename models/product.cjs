'use strict';
const { Model } = require('sequelize');
const generateUniqueSlug = require('../helpers/slugHelper.cjs'); // Import the slug helper function

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Many-to-many with Category
      Product.belongsToMany(models.Category, {
        through: 'ProductCategory',
        foreignKey: 'productId',
        as: 'categories'
      });

      // Many-to-many with Size
      Product.belongsToMany(models.Size, {
        through: 'ProductSize',
        foreignKey: 'productId',
        as: 'sizes'
      });

      // Many-to-many with Color
      Product.belongsToMany(models.Color, {
        through: 'ProductColor',
        foreignKey: 'productId',
        as: 'colors'
      });

      // Many-to-many with Collection
      Product.belongsToMany(models.Collection, {
        through: 'ProductCollection',
        foreignKey: 'productId',
        as: 'collections'
      });

      // Many-to-many with Scrub
      Product.belongsToMany(models.Scrub, {
        through: 'ProductScrub',
        foreignKey: 'productId',
        as: 'scrubs'
      });

      // One-to-many with Image
      Product.hasMany(models.Image, {
        foreignKey: 'productId',
        as: 'images'
      });
    }
  }

  Product.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL,
      stock: DataTypes.INTEGER,
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Product',
    }
  );

  // Use generateUniqueSlug from the helper file in hooks
  Product.beforeValidate(async (category) => {
    if (!category.slug) {
      category.slug = await generateUniqueSlug(category.name, Product);
    }
  });

  Product.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      product.slug = await generateUniqueSlug(product.name, Product);
    }
  });

  return Product;
};
