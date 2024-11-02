'use strict';
const { Model } = require('sequelize');
const generateUniqueSlug = require('../helpers/slugHelper.cjs'); // Import the slug helper function

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
    name: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true,  // Ensures the slug is unique
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Collection',
  });

  Collection.beforeValidate(async (category) => {
    if (!category.slug) {
      category.slug = await generateUniqueSlug(category.name, Collection);
    }
  });

  Collection.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      product.slug = await generateUniqueSlug(product.name, Collection);
    }
  });

  return Collection;
};