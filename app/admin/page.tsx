import { connectDB, Inquiry as InquiryModel, Product as ProductModel, Region as RegionModel, RegionProduct as RegionProductModel } from '@/lib/db';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await connectDB();
  const [regions, products, links, inquiries] = await Promise.all([
    RegionModel.find().lean(),
    ProductModel.find().lean(),
    RegionProductModel.find().lean(),
    InquiryModel.find().sort({ createdAt: -1 }).lean(),
  ]);

  const regionMap = new Map((regions as any[]).map((region) => [String(region._id), region]));
  const productMap = new Map((products as any[]).map((product) => [String(product._id), product]));
  const enrichedProducts = (links as any[]).map((link) => {
    const region = regionMap.get(String(link.regionId));
    const product = productMap.get(String(link.productId));

    return {
      exportId: String(link._id),
      regionId: String(link.regionId),
      regionName: region?.name || 'Unknown Region',
      regionProvince: region?.province || 'Nepal',
      productId: String(link.productId),
      name: product?.name || 'Unknown Product',
      description: link.description,
      category: link.category,
      price: link.price,
      slug: product?.slug || '',
    };
  });

  return (
    <AdminDashboard
      initialRegions={JSON.parse(JSON.stringify(regions))}
      initialProducts={JSON.parse(JSON.stringify(enrichedProducts))}
      initialInquiries={JSON.parse(JSON.stringify(inquiries))}
    />
  );
}
