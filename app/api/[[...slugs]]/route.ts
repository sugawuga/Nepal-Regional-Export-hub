import { Elysia } from 'elysia';
import mongoose from 'mongoose';
import { connectDB, Region } from '@/lib/db';
import { getSeedRegions } from '@/lib/seed-data';

const createExportItem = (input: any) => ({
  name: String(input?.name || '').trim(),
  description: String(input?.description || '').trim(),
  category: String(input?.category || 'Local Specialty').trim(),
  price: Number(input?.price ?? 0),
});

const normalizeBoolean = (value: any) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return false;
};

const createRegionPayload = (input: any) => {
  const coordinates = Array.isArray(input?.coordinates)
    ? input.coordinates.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value))
    : null;

  return {
    name: String(input?.name || '').trim(),
    province: String(input?.province || '').trim(),
    description: String(input?.description || '').trim(),
    is_verified: normalizeBoolean(input?.is_verified),
    location: {
      type: 'Point',
      coordinates: (coordinates && coordinates.length === 2 ? coordinates : [84.1240, 28.3949]) as [number, number],
    },
    exports: Array.isArray(input?.exports) ? input.exports.map(createExportItem).filter((item: any) => item.name) : [],
  };
};

const app = new Elysia({ prefix: '/api' })
  .onBeforeHandle(async () => {
    // Ensure DB connection before handling any request
    await connectDB();
  })
  .get('/admin/products', async () => {
    const regions = await Region.find().lean();
    return (regions as any[]).flatMap((region) =>
      (region.exports || []).map((exp: any) => ({
        regionId: String(region._id),
        regionName: region.name,
        regionProvince: region.province,
        exportId: String(exp._id),
        name: exp.name,
        description: exp.description,
        category: exp.category,
        price: exp.price,
        slug: String(exp.name || '')
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      }))
    );
  })
  .post('/admin/regions', async ({ body }) => {
    const payload = createRegionPayload(body);
    if (!payload.name || !payload.province || !payload.description) {
      return { error: 'name, province, and description are required' };
    }

    const created = await Region.create(payload);
    return created.toObject();
  })
  .put('/admin/regions/:id', async ({ params: { id }, body, set }) => {
    const rawBody = typeof body === 'string' ? JSON.parse(body) : body;
    const payload = createRegionPayload(rawBody);
    if (!payload.name || !payload.province || !payload.description) {
      set.status = 400;
      return { error: 'name, province, and description are required' };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      set.status = 400;
      return { error: 'Invalid region id' };
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const update = {
      name: payload.name,
      province: payload.province,
      description: payload.description,
      is_verified: normalizeBoolean((rawBody as any)?.is_verified ?? (rawBody as any)?.isVerified),
      location: payload.location,
      exports: payload.exports,
    };

    const result = await Region.collection.updateOne({ _id: objectId }, { $set: update });

    if (!result.matchedCount) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    return await Region.collection.findOne({ _id: objectId });
  })
  .delete('/admin/regions/:id', async ({ params: { id }, set }) => {
    const deleted = await Region.findByIdAndDelete(id).lean();
    if (!deleted) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    return { success: true };
  })
  .post('/admin/regions/:id/exports', async ({ params: { id }, body, set }) => {
    const region = await Region.findById(id);
    if (!region) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    const item = createExportItem(body);
    if (!item.name || !item.description || !item.category) {
      set.status = 400;
      return { error: 'name, description, and category are required' };
    }

    region.exports.push(item as any);
    await region.save();
    return region.toObject();
  })
  .put('/admin/regions/:id/exports/:exportId', async ({ params: { id, exportId }, body, set }) => {
    const region = await Region.findById(id);
    if (!region) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    const exportItem = region.exports.id(exportId);
    if (!exportItem) {
      set.status = 404;
      return { error: 'Product not found' };
    }

    const item = createExportItem(body);
    if (!item.name || !item.description || !item.category) {
      set.status = 400;
      return { error: 'name, description, and category are required' };
    }

    exportItem.set(item);
    await region.save();
    return region.toObject();
  })
  .delete('/admin/regions/:id/exports/:exportId', async ({ params: { id, exportId }, set }) => {
    const region = await Region.findById(id);
    if (!region) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    const exportItem = region.exports.id(exportId);
    if (!exportItem) {
      set.status = 404;
      return { error: 'Product not found' };
    }

    exportItem.deleteOne();
    await region.save();
    return region.toObject();
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
