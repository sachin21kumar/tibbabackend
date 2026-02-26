import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();

  const db = client.db();
  const products = db.collection('products');

  const docs = await products.find({ name: { $exists: true } }).toArray();

  let count = 0;

  for (const p of docs) {
    const englishName = p.name || '';
    const englishDesc = p.description || '';

    await products.updateOne(
      { _id: p._id },
      {
        $set: {
          translations: {
            en: {
              name: englishName,
              description: englishDesc,
            },
            ar: {
              name: englishName,
              description: englishDesc,
            },
          },
        },
        $unset: {
          name: '',
          description: '',
        },
      },
    );

    count++;
  }

  await client.close();
}

run();
