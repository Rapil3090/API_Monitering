const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'ApiResponse',
    tableName: 'apiresponse',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        responseTime: {
            type: 'int',
            nullable: false,
        },

        body: {
            type: 'text',
            nullable: false,
        },

        statusCode: {
            type: 'int',
            nullable: false,
        },

    },
});