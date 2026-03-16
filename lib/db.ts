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

// Schemas
const exportItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
});

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  exports: [exportItemSchema],
});

// 2dsphere indexing for geospatial queries
regionSchema.index({ location: '2dsphere' });

export const Region = mongoose.models.Region || mongoose.model('Region', regionSchema);
export const ExportItem = mongoose.models.ExportItem || mongoose.model('ExportItem', exportItemSchema);
