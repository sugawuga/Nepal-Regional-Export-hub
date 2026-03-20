import mongoose from 'mongoose';
import { connectDB, Product, Region, RegionProduct } from './db';
import { getSeedProducts, getSeedRegionProducts, getSeedRegions } from './seed-data';

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database.');

    console.log('🧹 Clearing existing data...');
    await Region.deleteMany({});
    await Product.deleteMany({});
    await RegionProduct.deleteMany({});

    console.log('🗺️ Inserting sample regions, products, and region-product links...');
    const regions = await Region.insertMany(getSeedRegions());
    const regionIdByName = new Map(regions.map((region) => [region.name.toLowerCase(), region._id]));

    const products = await Product.insertMany(getSeedProducts());
    const productIdByName = new Map(products.map((product) => [product.name.toLowerCase(), product._id]));

    const regionProducts = getSeedRegionProducts()
      .map((item) => ({
        regionId: regionIdByName.get(item.regionName.toLowerCase()),
        productId: productIdByName.get(item.productName.toLowerCase()),
        description: item.description,
        category: item.category,
        price: item.price,
      }))
      .filter((item) => item.regionId && item.productId);

    await RegionProduct.insertMany(regionProducts as any[]);

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
