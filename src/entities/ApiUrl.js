const { EntitySchema } = require('typorm');

module.exports = new EntitySchema({
    name: 'ApiUrl',
    tableName: 'apiurl',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        
        crawledUrl: {
            type: 'text',
            nullable: true,
        }
        
    }
})