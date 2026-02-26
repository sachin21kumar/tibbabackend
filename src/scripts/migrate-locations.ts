import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

async function run() {
  const uri = process.env.MONGO_URI as string;

  if (!uri) {
    console.log('❌ MONGO_URI missing in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const locations = db.collection('locations');

  const docs = await locations.find({ name: { $exists: true } }).toArray();

  let index = 0;

  for (const loc of docs) {
    index++;

    const enName = loc.name || '';
    const enDesc = loc.description || '';
    const enArea = loc.area || '';
    const enLocation = loc.location || '';

    const translations = {
      en: {
        name: enName,
        description: enDesc,
        area: enArea,
        location: enLocation,
      },
      ar: {
        name: enName,
        description: enDesc,
        area: enArea,
        location: enLocation,
      },
    };

    await locations.updateOne(
      { _id: loc._id },
      {
        $set: { translations },
        $unset: {
          name: '',
          description: '',
          area: '',
          location: '',
        },
      },
    );
  }

  await client.close();
}

run();
