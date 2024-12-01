const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ApiEndpoint',
  tableName: 'apiendpoint',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    url: {
      type: 'varchar',
      nullable: false,
    },
    // serviceKey: {
    //   type: 'varchar',
    //   nullable: true,
    // },
    parameters: {
      type: 'jsonb',
      nullable: true,
    },
  },
});
