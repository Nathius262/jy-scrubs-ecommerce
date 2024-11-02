'use strict';
const { Model } = require('sequelize');
const generateUniqueSlug = require('../helpers/slugHelper.cjs'); // Import the slug helper function

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
    name: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true,  // Ensures the slug is unique
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Scrub',
  });

  Scrub.beforeValidate(async (category) => {
    if (!category.slug) {
      category.slug = await generateUniqueSlug(category.name, Scrub);
    }
  });

  Scrub.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      product.slug = await generateUniqueSlug(product.name, Scrub);
    }
  });
  return Scrub;
};