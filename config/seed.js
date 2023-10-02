// Importing database pool object
const { db } = require('./index')
// Importing envelopes object
const importedEnvelopes = require('./db');

 
// Define the table creation and data insertion statements
const createEnvelopesTableQuery = `
  CREATE TABLE IF NOT EXISTS envelopes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    budget INTEGER NOT NULL
  );
`;

// Seed function to create tables and insert data into the database
async function seed() {
  try {
    // Connect to the database
    const client = await db.connect();
    // Create the "envelopes" table
    await client.query(createEnvelopesTableQuery);

    // Check if the "envelopes" table has contents
    const countQuery = 'SELECT COUNT(*) FROM envelopes';
    const result = await client.query(countQuery);
    const rowCount = parseInt(result.rows[0].count, 10);

    if (rowCount > 0) {
      console.log('The "envelopes" table already has contents and does not need to be seeded');
    } else {
        // Insert envelopes into the "envelopes" table
        await client.query('BEGIN');
        await Promise.all(
            importedEnvelopes.map(async (envelope) => {
            const { id, title, budget } = envelope;
            const query = 'INSERT INTO envelopes (id, title, budget) VALUES ($1, $2, $3)';
            await client.query(query, [id, title, budget]);
        })
        );
        await client.query('COMMIT');

        // Disconnect from the database
        client.release();

        console.log('Seed data inserted successfully.');
    }
    } catch (error) {
        console.error('Error seeding the database:', error);
    }
    
}

// Call the seed function to create tables and insert the data
seed();
