'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Role, {
        through: 'UserRole',  // Junction table
        foreignKey: 'userId',
        as: 'roles'
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Role',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};