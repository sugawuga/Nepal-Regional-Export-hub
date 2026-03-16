import { Elysia, t } from 'elysia';
import { connectDB, Region } from '@/lib/db';

const app = new Elysia({ prefix: '/api' })
  .onBeforeHandle(async () => {
    // Ensure DB connection before handling any request
    await connectDB();
  })
  .get('/regions', async () => {
    // Seed mock data if empty for demonstration
    const count = await Region.countDocuments();
    if (count === 0) {
      await Region.create([
        {
          name: 'Ilam',
          description: 'Famous for its rolling tea gardens and pristine landscapes.',
          location: { type: 'Point', coordinates: [87.9236, 26.9155] },
          exports: [{ name: 'Ilam Tea', description: 'Orthodox tea with a rich aroma.', category: 'Beverage', price: 15 }]
        },
        {
          name: 'Mustang',
          description: 'High altitude desert known for sweet apples and ancient culture.',
          location: { type: 'Point', coordinates: [83.8473, 28.9985] },
          exports: [{ name: 'Mustang Apples', description: 'Crisp, sweet, and organic apples.', category: 'Fruit', price: 5 }]
        },
        {
          name: 'Bhaktapur',
          description: 'The city of devotees, renowned for its traditional pottery and yogurt.',
          location: { type: 'Point', coordinates: [85.4295, 27.6710] },
          exports: [{ name: 'Bhaktapur Pottery', description: 'Handcrafted clay pottery.', category: 'Handicraft', price: 25 }]
        }
      ]);
    }
    return await Region.find().lean();
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
