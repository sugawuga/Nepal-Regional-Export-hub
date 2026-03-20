import { Elysia } from 'elysia';
import mongoose from 'mongoose';
import { connectDB, Inquiry, Product, Region, RegionProduct } from '@/lib/db';
import { getSeedProducts, getSeedRegionProducts, getSeedRegions } from '@/lib/seed-data';

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  };
};

const createProductPayload = (input: any) => ({
  regionId: input?.regionId,
  productId: input?.productId,
  name: String(input?.name || '').trim(),
  slug: slugify(String(input?.slug || input?.name || '').trim()),
  description: String(input?.description || '').trim(),
  category: String(input?.category || 'Local Specialty').trim(),
  price: Number(input?.price ?? 0),
});

const createInquiryPayload = (input: any) => ({
  regionId: input?.regionId && mongoose.Types.ObjectId.isValid(input.regionId) ? input.regionId : null,
  productId: input?.productId && mongoose.Types.ObjectId.isValid(input.productId) ? input.productId : null,
  regionName: String(input?.regionName || '').trim(),
  regionProvince: String(input?.regionProvince || '').trim(),
  productName: String(input?.productName || '').trim(),
  fullName: String(input?.fullName || '').trim(),
  email: String(input?.email || '').trim(),
  phone: String(input?.phone || '').trim(),
  company: String(input?.company || '').trim(),
  quantity: String(input?.quantity || '').trim(),
  message: String(input?.message || '').trim(),
});

const ensureBaseProduct = async (payload: { productId?: string; name: string; slug: string }) => {
  if (payload.productId && mongoose.Types.ObjectId.isValid(payload.productId)) {
    const existing = await Product.findById(payload.productId).lean();
    if (existing) return existing;
  }

  if (!payload.name) return null;

  const slug = payload.slug || slugify(payload.name);
  const existingBySlug = await Product.findOne({ slug }).lean();
  if (existingBySlug) return existingBySlug;

  return await Product.create({ name: payload.name, slug });
};

const cleanupOrphanProduct = async (productId?: string | mongoose.Types.ObjectId | null) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) return;

  const objectId = new mongoose.Types.ObjectId(String(productId));
  const remainingLinks = await RegionProduct.countDocuments({ productId: objectId });
  if (remainingLinks === 0) {
    await Product.findByIdAndDelete(objectId);
  }
};

const serializeProduct = (entry: any, region: any, product: any) => {
  return {
    exportId: String(entry._id),
    regionId: String(region._id),
    regionName: region.name,
    regionProvince: region.province,
    productId: String(product._id),
    name: product.name,
    slug: product.slug || slugify(String(product.name || '')),
    description: entry.description,
    category: entry.category,
    price: entry.price,
  };
};

const listProductsWithRegions = async () => {
  const [regions, products, links] = await Promise.all([
    Region.find().lean(),
    Product.find().lean(),
    RegionProduct.find().lean(),
  ]);

  const regionMap = new Map((regions as any[]).map((region) => [String(region._id), region]));
  const productMap = new Map((products as any[]).map((product) => [String(product._id), product]));

  return (links as any[])
    .map((link) => {
      const region = regionMap.get(String(link.regionId));
      const product = productMap.get(String(link.productId));
      if (!region || !product) return null;
      return serializeProduct(link, region, product);
    })
    .filter(Boolean);
};

const app = new Elysia({ prefix: '/api' })
  .onBeforeHandle(async () => {
    // Ensure DB connection before handling any request
    await connectDB();
  })
  .get('/products', async () => {
    return await listProductsWithRegions();
  })
  .get('/admin/products', async () => {
    return await listProductsWithRegions();
  })
  .get('/admin/inquiries', async () => {
    return await Inquiry.find().sort({ createdAt: -1 }).lean();
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
    };

    const result = await Region.collection.updateOne({ _id: objectId }, { $set: update });

    if (!result.matchedCount) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    return await Region.collection.findOne({ _id: objectId });
  })
  .delete('/admin/regions/:id', async ({ params: { id }, set }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      set.status = 400;
      return { error: 'Invalid region id' };
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const linkedProducts = await RegionProduct.find({ regionId: objectId }).lean();
    await RegionProduct.deleteMany({ regionId: objectId });

    const deleted = await Region.findByIdAndDelete(objectId).lean();
    if (!deleted) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    const uniqueProductIds = Array.from(new Set((linkedProducts as any[]).map((link) => String(link.productId))));
    await Promise.all(uniqueProductIds.map((productId) => cleanupOrphanProduct(productId)));

    return { success: true };
  })
  .post('/admin/products', async ({ body, set }) => {
    const payload = createProductPayload(body);
    if (!payload.regionId || !mongoose.Types.ObjectId.isValid(payload.regionId)) {
      set.status = 400;
      return { error: 'regionId is required' };
    }

    const regionDoc = await Region.findById(payload.regionId).lean();
    if (!regionDoc) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    if (!payload.name || !payload.description || !payload.category) {
      set.status = 400;
      return { error: 'name, description, and category are required' };
    }

    const baseProduct = await ensureBaseProduct(payload);
    if (!baseProduct) {
      set.status = 400;
      return { error: 'product name is required' };
    }

    const existingLink = await RegionProduct.findOne({ regionId: payload.regionId, productId: baseProduct._id }).lean();
    if (existingLink) {
      set.status = 409;
      return { error: 'Product already exists for this region' };
    }

    const created = await RegionProduct.create({
      regionId: payload.regionId,
      productId: baseProduct._id,
      description: payload.description,
      category: payload.category,
      price: payload.price,
    });

    return serializeProduct(created.toObject(), regionDoc, baseProduct);
  })
  .post('/inquiries', async ({ body, set }) => {
    const rawBody = typeof body === 'string' ? JSON.parse(body) : body;
    const payload = createInquiryPayload(rawBody);

    if (!payload.regionName || !payload.regionProvince || !payload.fullName || !payload.email || !payload.message) {
      set.status = 400;
      return { error: 'regionName, regionProvince, fullName, email, and message are required' };
    }

    if (payload.regionId && !mongoose.Types.ObjectId.isValid(payload.regionId)) {
      set.status = 400;
      return { error: 'Invalid regionId' };
    }

    if (payload.productId && !mongoose.Types.ObjectId.isValid(payload.productId)) {
      set.status = 400;
      return { error: 'Invalid productId' };
    }

    const created = await Inquiry.create(payload);
    return created.toObject();
  })
  .put('/admin/products/:id', async ({ params: { id }, body, set }) => {
    const payload = createProductPayload(body);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      set.status = 400;
      return { error: 'Invalid product id' };
    }

    if (!payload.regionId || !mongoose.Types.ObjectId.isValid(payload.regionId)) {
      set.status = 400;
      return { error: 'regionId is required' };
    }

    const regionDoc = await Region.findById(payload.regionId).lean();
    if (!regionDoc) {
      set.status = 404;
      return { error: 'Region not found' };
    }

    if (!payload.name || !payload.description || !payload.category) {
      set.status = 400;
      return { error: 'name, description, and category are required' };
    }

    const baseProduct = await ensureBaseProduct(payload);
    if (!baseProduct) {
      set.status = 400;
      return { error: 'product name is required' };
    }

    const previous = await RegionProduct.findById(id).lean();
    const updated = await RegionProduct.findByIdAndUpdate(id, {
      $set: {
        regionId: payload.regionId,
        productId: baseProduct._id,
        description: payload.description,
        category: payload.category,
        price: payload.price,
      },
    }, { new: true }).lean();
    if (!updated) {
      set.status = 404;
      return { error: 'Product not found' };
    }

    if (previous && String(previous.productId) !== String(baseProduct._id)) {
      await cleanupOrphanProduct(previous.productId as any);
    }

    return serializeProduct(updated, regionDoc, baseProduct);
  })
  .delete('/admin/products/:id', async ({ params: { id }, set }) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      set.status = 400;
      return { error: 'Invalid product id' };
    }

    const deleted = await RegionProduct.findByIdAndDelete(id).lean();

    if (!deleted) {
      set.status = 404;
      return { error: 'Product not found' };
    }

    await cleanupOrphanProduct((deleted as any).productId);

    return { success: true };
  })
  .get('/regions', async ({ query }) => {
    const { q } = query as Record<string, string | undefined>;
    
    // Ensure DB connection
    await connectDB();

    // Seed mock data if empty for demonstration
    const count = await Region.countDocuments();
    if (count === 0) {
      const regions = await Region.insertMany(getSeedRegions());
      const regionIdByName = new Map((regions as any[]).map((region) => [String(region.name).toLowerCase(), region._id]));
      const baseProducts = await Product.insertMany(getSeedProducts());
      const productIdByName = new Map((baseProducts as any[]).map((product) => [String(product.name).toLowerCase(), product._id]));

      const regionProducts = getSeedRegionProducts()
        .map((item) => ({
          regionId: regionIdByName.get(item.regionName.toLowerCase()),
          productId: productIdByName.get(item.productName.toLowerCase()),
          description: item.description,
          category: item.category,
          price: item.price,
        }))
        .filter((item) => item.regionId && item.productId);

      if (regionProducts.length) {
        await RegionProduct.insertMany(regionProducts as any[]);
      }
    } else {
      const productCount = await Product.countDocuments();
      const relationCount = await RegionProduct.countDocuments();
      if (productCount === 0 || relationCount === 0) {
        const regions = await Region.find().lean();
        if (productCount === 0) {
          await Product.insertMany(getSeedProducts());
        }

        const baseProducts = await Product.find().lean();
        const regionIdByName = new Map((regions as any[]).map((region) => [String(region.name).toLowerCase(), region._id]));
        const productIdByName = new Map((baseProducts as any[]).map((product) => [String(product.name).toLowerCase(), product._id]));

        if (relationCount === 0) {
          const regionProducts = getSeedRegionProducts()
            .map((item) => ({
              regionId: regionIdByName.get(item.regionName.toLowerCase()),
              productId: productIdByName.get(item.productName.toLowerCase()),
              description: item.description,
              category: item.category,
              price: item.price,
            }))
            .filter((item) => item.regionId && item.productId);

          if (regionProducts.length) {
            await RegionProduct.insertMany(regionProducts as any[]);
          }
        }
      }
    }

    if (q) {
      const searchRegex = new RegExp(escapeRegExp(q), 'i');

      const [regionsByText, productsByText, linksByText] = await Promise.all([
        Region.find({
          $or: [
            { name: searchRegex },
            { province: searchRegex },
            { description: searchRegex },
          ],
        }).lean(),
        Product.find({
          $or: [{ name: searchRegex }, { slug: searchRegex }],
        }).lean(),
        RegionProduct.find({
          $or: [{ description: searchRegex }, { category: searchRegex }],
        }).lean(),
      ]);

      const regionIds = new Set((regionsByText as any[]).map((region) => String(region._id)));
      const matchedProductIds = new Set((productsByText as any[]).map((product) => String(product._id)));

      for (const link of linksByText as any[]) {
        if (matchedProductIds.has(String(link.productId))) {
          regionIds.add(String(link.regionId));
        }
      }

      if (regionIds.size === 0) {
        return [];
      }

      return await Region.find({ _id: { $in: Array.from(regionIds) } }).lean();
    }

    return await Region.find().lean();
  })
  .get('/regions/:name', async ({ params: { name } }) => {
    return await Region.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i') }).lean();
  })
  .get('/produce/:id', async ({ params: { id } }) => {
    const relation = await RegionProduct.findById(id).lean();
    if (!relation) return null;

    const [region, product] = await Promise.all([
      Region.findById((relation as any).regionId).lean(),
      Product.findById((relation as any).productId).lean(),
    ]);

    if (!region || !product) return null;

    return serializeProduct(relation, region, product);
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
