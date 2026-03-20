import mongoose from 'mongoose';
import { connectDB, Region } from './db';
import { getSeedRegions } from './seed-data';

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database.');

    console.log('🧹 Clearing existing data...');
    await Region.deleteMany({});

    console.log('🗺️ Inserting sample regions and exports...');
    const regions = getSeedRegions();
    await Region.insertMany(regions);

    console.log('🚀 Data successfully injected! You can now refresh your MongoDB dashboard.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    console.log('🔌 Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
