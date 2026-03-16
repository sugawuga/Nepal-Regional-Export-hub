import mongoose from 'mongoose';
import { connectDB, Region, ExportItem } from './db';

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database.');

    console.log('🧹 Clearing existing data...');
    await Region.deleteMany({});
    await ExportItem.deleteMany({});

    console.log('🗺️ Inserting sample regions and exports...');
    const regions = [
      {
        name: 'Ilam',
        description: 'Famous for its rolling tea gardens and pristine landscapes.',
        location: { type: 'Point', coordinates: [87.9236, 26.9155] },
        exports: [
          { name: 'Ilam Tea', description: 'Orthodox tea with a rich aroma.', category: 'Beverage', price: 15 },
          { name: 'Cardamom', description: 'Large cardamom grown in the eastern hills.', category: 'Spice', price: 20 }
        ]
      },
      {
        name: 'Mustang',
        description: 'High altitude desert known for sweet apples and ancient culture.',
        location: { type: 'Point', coordinates: [83.8473, 28.9985] },
        exports: [
          { name: 'Mustang Apples', description: 'Crisp, sweet, and organic apples.', category: 'Fruit', price: 5 },
          { name: 'Jimbu', description: 'Aromatic Himalayan herb used for tempering.', category: 'Herb', price: 12 }
        ]
      },
      {
        name: 'Bhaktapur',
        description: 'The city of devotees, renowned for its traditional pottery and yogurt.',
        location: { type: 'Point', coordinates: [85.4295, 27.6710] },
        exports: [
          { name: 'Bhaktapur Pottery', description: 'Handcrafted clay pottery.', category: 'Handicraft', price: 25 },
          { name: 'Juju Dhau', description: 'The famous "King Yogurt" of Bhaktapur.', category: 'Dairy', price: 3 }
        ]
      }
    ];

    await Region.insertMany(regions);

    console.log('🚀 Data successfully injected! You can now refresh your MongoDB Atlas dashboard.');
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
