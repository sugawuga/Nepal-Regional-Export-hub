import { Elysia, t } from 'elysia';
import { connectDB, Region } from '@/lib/db';
import { getSeedRegions } from '@/lib/seed-data';

const app = new Elysia({ prefix: '/api' })
  .onBeforeHandle(async () => {
    // Ensure DB connection before handling any request
    await connectDB();
  })
  .get('/regions', async ({ query }) => {
    const { q } = query as Record<string, string | undefined>;
    
    // Ensure DB connection
    await connectDB();

    // Seed mock data if empty for demonstration
    const count = await Region.countDocuments();
    if (count === 0) {
      await Region.create(getSeedRegions());
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      return await Region.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { 'exports.name': searchRegex }
        ]
      }).lean();
    }

    return await Region.find().lean();
  })
  .get('/regions/:name', async ({ params: { name } }) => {
    return await Region.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
  })
  .get('/produce/:id', async ({ params: { id } }) => {
    const region = await Region.findOne({ 'exports._id': id }).lean();
    return region?.exports.find((e: any) => e._id.toString() === id) || null;
  })
  .get('/search/near', async ({ query }) => {
    const { lat, lng, distance = "50000" } = query as Record<string, string | undefined>;
    if (!lat || !lng) return { error: 'lat and lng required' };
    
    return await Region.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance, 10)
        }
      }
    }).lean();
  });

export type App = typeof app;

// Next.js App Router Catch-all Handlers
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
