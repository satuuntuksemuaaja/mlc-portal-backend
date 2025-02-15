'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'mlcppapp.role',
      [
        {
          id: 2,
          name: 'administrator'
        },
        {
          id: 1,
          name: 'user'
        }
      ],
      {}
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role', null, {
      truncate: true,
      cascade: true
    });
  }
};
