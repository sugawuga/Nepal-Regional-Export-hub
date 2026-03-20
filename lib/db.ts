import mongoose from 'mongoose';

// The global connection pooler for hot reloads
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nepal-exports';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  province: { type: String, required: true },
  description: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, index: true },
});

const regionProductSchema = new mongoose.Schema({
  regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
});

const inquirySchema = new mongoose.Schema(
  {
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', index: true, default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true, default: null },
    regionName: { type: String, required: true },
    regionProvince: { type: String, required: true },
    productName: { type: String, default: '' },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    quantity: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, default: 'new' },
  },
  { timestamps: true }
);

// 2dsphere indexing for geospatial queries
regionSchema.index({ location: '2dsphere' });
regionProductSchema.index({ regionId: 1, productId: 1 }, { unique: true });

export const Region = mongoose.models.Region || mongoose.model('Region', regionSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const RegionProduct = mongoose.models.RegionProduct || mongoose.model('RegionProduct', regionProductSchema);
export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
