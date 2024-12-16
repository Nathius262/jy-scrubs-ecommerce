'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      OrderItem.belongsTo(models.Size, { foreignKey: 'sizeId', as: 'size' });
      OrderItem.belongsTo(models.Color, { foreignKey: 'colorId', as: 'color' });

    }
  }
  OrderItem.init({
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    sizeId: DataTypes.INTEGER,
    colorId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    totalPrice: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};