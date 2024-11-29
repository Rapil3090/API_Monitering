
const { query } = require('./db');

const initDb = async () => {
    try {
      const createApiEndpointTable = `
        CREATE TABLE IF NOT EXISTS apiendpoint (
          id SERIAL PRIMARY KEY,
          "url" VARCHAR(3000) NOT NULL,
          "serviceKey" VARCHAR(3000),
          "parameters" JSONB
        );
      `;
  
      const addCreatedAtColumn = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'apiendpoint' AND column_name = 'createdat'
          ) THEN
            ALTER TABLE apiendpoint ADD COLUMN createdAt TIMESTAMP DEFAULT NOW();
          END IF;
        END $$;
      `;
  
      console.log('Initializing database...');
      await query(createApiEndpointTable);  
      await query(addCreatedAtColumn);     
      console.log('Database initialized and updated successfully!');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };
  

module.exports = initDb;
