const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  
  try {
    await client.query(`
      UPDATE _prisma_migrations
      SET checksum = '4d0ea59cd082baaa6bf07ed847ceda2e63e710f5e3c93bd960b14461f4750ed1'
      WHERE migration_name = '20260901000000_sync_db_push_changes';
    `);
    console.log('Successfully updated checksum.');
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
