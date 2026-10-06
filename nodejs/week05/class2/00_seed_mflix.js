// Load MongoDB's sample_mflix database into the local mongo container.
// Run ONCE (about 60 MB to download, a minute or two):
//   docker compose exec node node week05/class2/00_seed_mflix.js
// Already loaded? It skips any collection that has documents.
// Start over (e.g. after deleting half the movies):
//   docker compose exec node node week05/class2/00_seed_mflix.js --force
//
// This is the same sample data Atlas offers under "Load Sample Dataset".
// The files are mongoexport format: one document per line, in Extended JSON
// ({"$oid": ...}, {"$date": ...}) so ObjectIds and Dates survive the trip.

const readline = require('readline');
const { Readable } = require('stream');
const { MongoClient, BSON } = require('mongodb');
const config = require('../../config');

const SOURCE = 'https://raw.githubusercontent.com/neelabalan/mongodb-sample-dataset/main/sample_mflix/';
const DB_NAME = 'sample_mflix';
const BATCH = 1000;
const force = process.argv.includes('--force');

// collection -> indexes to create after loading
const collections = {
  movies: [{ title: 1 }, { year: 1 }, { genres: 1 }],
  comments: [{ movie_id: 1, date: -1 }],
  theaters: [{ theaterId: 1 }],
  users: [{ email: 1 }],
};

async function load(db, name) {
  const collection = db.collection(name);
  const existing = await collection.estimatedDocumentCount();

  if (existing > 0 && !force) {
    console.log(`${name}: already has ${existing} documents, skipping (use --force to reload)`);
    return;
  }
  if (existing > 0) await collection.drop();

  console.log(`${name}: downloading...`);
  const res = await fetch(SOURCE + name + '.json');
  if (!res.ok) throw new Error(`download of ${name}.json failed: HTTP ${res.status}`);

  // Read the download line by line instead of holding 40 MB of text in memory
  const lines = readline.createInterface({ input: Readable.fromWeb(res.body) });
  let batch = [];
  let total = 0;

  for await (const line of lines) {
    if (!line.trim()) continue;
    batch.push(BSON.EJSON.parse(line, { relaxed: false }));
    if (batch.length === BATCH) {
      await collection.insertMany(batch, { ordered: false });
      total += batch.length;
      batch = [];
      process.stdout.write(`\r${name}: ${total} inserted`);
    }
  }
  if (batch.length) {
    await collection.insertMany(batch, { ordered: false });
    total += batch.length;
  }

  for (const keys of collections[name]) await collection.createIndex(keys);
  console.log(`\r${name}: ${total} inserted, indexes created`);
}

async function main() {
  const client = new MongoClient(config.mongoUrl);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    for (const name of Object.keys(collections)) await load(db, name);
    console.log(`Done. Browse it in Compass: mongodb://localhost:27017 > ${DB_NAME}`);
  } catch (err) {
    console.error('\nSeeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
