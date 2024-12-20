'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
      Order.hasMany(models.DeliveryStatus, { foreignKey: 'orderId', as: 'deliveryStatus' });
      Order.hasOne(models.Address, { foreignKey: 'orderId', as: 'address' });
    }
  }
  Order.init({
    trackingId: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    totalAmount: DataTypes.DECIMAL,
    currency: DataTypes.STRING,
    status: DataTypes.STRING,
    paidAt: DataTypes.DATE,
    paymentChannel: DataTypes.STRING,
    gatewayResponse: DataTypes.STRING,
    deliveryEligible: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};