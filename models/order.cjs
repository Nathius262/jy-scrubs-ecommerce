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
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    totalAmount: DataTypes.DECIMAL,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'  // <-- Default value added here
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};