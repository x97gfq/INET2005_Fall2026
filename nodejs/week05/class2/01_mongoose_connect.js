// Mongoose 1: connect, use a model, and watch the schema reject bad data
// First (once):  docker compose exec node node week05/class2/00_seed_mflix.js
// Run:           docker compose exec node node week05/class2/01_mongoose_connect.js
//
// Week 4 used the mongodb driver directly: collection.find(...).toArray().
// Mongoose sits on top of the driver and adds a schema - rules for your documents.

const mongoose = require('mongoose');
const config = require('../../config');
const Movie = require('./movies-api/models/Movie'); // the model the API uses too

async function main() {
  await mongoose.connect(config.mongoUrl, { dbName: 'sample_mflix' });
  console.log('Connected to sample_mflix');

  // Model.find() returns documents - no .toArray() needed
  const total = await Movie.countDocuments();
  console.log(`\n${total} movies. Top 5 sci-fi by IMDb rating (min 10,000 votes):`);

  const top = await Movie.find({ genres: 'Sci-Fi', 'imdb.votes': { $gte: 10000 } })
    .sort({ 'imdb.rating': -1 })
    .limit(5)
    .select('title year imdb.rating'); // only these fields (plus _id)

  top.forEach((m) => console.log(`  ${m.imdb.rating}  ${m.title} (${m.year})`));

  // findById takes the _id string straight from a URL
  const matrix = await Movie.findOne({ title: 'The Matrix' });
  console.log(`\nfindById('${matrix._id}') ->`, (await Movie.findById(matrix._id)).title);

  // The schema at work: validate() checks a document WITHOUT saving it
  const bad = new Movie({ year: 1066, runtime: -5, type: 'podcast' });
  try {
    await bad.validate();
  } catch (err) {
    console.log('\nThe schema rejected the bad movie:');
    for (const [field, problem] of Object.entries(err.errors)) {
      console.log(`  ${field}: ${problem.message}`);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exitCode = 1;
  mongoose.disconnect();
});
