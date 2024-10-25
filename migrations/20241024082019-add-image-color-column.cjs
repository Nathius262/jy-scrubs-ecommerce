'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:*/
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Colors', 'image_url', {type: Sequelize.DataTypes.STRING}, { transaction });
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
     
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('Colors');
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Colors', 'image_url', { transaction },);
      await transaction.commit();
      
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  }
};
