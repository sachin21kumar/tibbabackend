import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import translate from 'translate-google';

const uri = "mongodb://127.0.0.1:27017/restaurant_db";

async function run() {
  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(); // uses DB from URI
  const collection = db.collection('categories'); // <-- your collection name

  const categories = await collection.find({}).toArray();

  console.log('Total categories:', categories.length);

  for (const cat of categories) {

    // already migrated
    if (cat.translations?.ar) continue;

    if (!cat.title) continue;

    const arabic = await translate(cat.title, { to: 'ar' });

    await collection.updateOne(
      { _id: cat._id },
      {
        $set: {
          translations: {
            en: { title: cat.title },
            ar: { title: arabic },
          },
        },
        $unset: { title: "" },
      }
    );

    console.log('Migrated:', cat.title);
  }

  console.log('Migration finished ✅');

  await client.close();
}

run();