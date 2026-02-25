import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient(process.env.MONGO_URI as string);
  await client.connect();

  const db = client.db();
  const products = db.collection('products');

  // find old products
  const docs = await products.find({ name: { $exists: true } }).toArray();

  console.log('Products found for migration:', docs.length);

  let count = 0;

  for (const p of docs) {
    const englishName = p.name || '';
    const englishDesc = p.description || '';

    // 👇 IMPORTANT: copy english to arabic for now
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
          name: "",
          description: "",
        },
      }
    );

    count++;
    console.log(`[${count}/${docs.length}] Migrated:`, englishName);
  }

  console.log('PRODUCT MIGRATION COMPLETED ✅');
  await client.close();
}

run();