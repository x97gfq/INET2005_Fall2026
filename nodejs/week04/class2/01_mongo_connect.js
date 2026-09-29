// MongoDB 1: connect, list what is there, look at one document
// Run:  docker compose exec node node week04/class2/01_mongo_connect.js

const { MongoClient } = require('mongodb');
const config = require('../../config');

async function main() {
  const client = new MongoClient(config.mongoUrl);

  try {
    await client.connect();
    console.log('Connected to', config.mongoUrl);

    // A server holds databases; a database holds collections; a collection holds documents
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs.databases.map((d) => d.name));

    const db = client.db(config.mongoDb);
    const collections = await db.listCollections().toArray();
    console.log(`Collections in ${config.mongoDb}:`, collections.map((c) => c.name));

    const sales = db.collection('sales');
    console.log('Documents in sales:', await sales.countDocuments());

    // One whole document - note the nested customer object and the items array
    const one = await sales.findOne();
    console.dir(one, { depth: null });
  } finally {
    await client.close(); // always close, even if something above threw
  }
}

main().catch((err) => console.error('Error:', err.message));
