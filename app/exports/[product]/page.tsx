import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Package } from 'lucide-react';
import { connectDB, Product as ProductModel, Region as RegionModel, RegionProduct as RegionProductModel } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ProductRegion {
  name: string;
  province: string;
  slug: string;
  description: string;
  category: string;
  price: number | string;
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function ProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  const productSlug = decodeURIComponent(product);

  await connectDB();
  const [regions, products, links] = await Promise.all([
    RegionModel.find().lean(),
    ProductModel.find({ slug: productSlug }).lean(),
    RegionProductModel.find().lean(),
  ]);
  const productIds = new Set((products as any[]).map((item) => String(item._id)));
  const regionMap = new Map((regions as any[]).map((region) => [String(region._id), region]));

  const matchedRegions: ProductRegion[] = [];
  let productName = titleCaseFromSlug(productSlug);

  for (const link of links as any[]) {
    if (!productIds.has(String(link.productId))) continue;
    const region = regionMap.get(String(link.regionId));
    if (!region) continue;

    const product = (products as any[])[0];
    productName = String(product?.name || productName);
    matchedRegions.push({
      name: String(region.name || ''),
      province: String(region.province || 'Nepal'),
      slug: String(region.name || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      description: String(link.description || ''),
      category: String(link.category || 'Export'),
      price: link.price ?? '—',
    });
  }

  if (matchedRegions.length === 0) {
    return notFound();
  }

  const uniqueRegions = matchedRegions.filter(
    (region, index, self) => index === self.findIndex((item) => item.slug === region.slug)
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      <section className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/exports"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to Exports</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-500 text-sm shadow-sm">
            <Package size={16} className="text-emerald-600" />
            Product Detail
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
            Export commodity
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-900 leading-[0.95] mb-6">
            {productName}
          </h1>
          <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mb-10">
            Regions across Nepal that currently export {productName.toLowerCase()}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="text-sm text-stone-500 mb-1">Regions exporting this product</div>
              <div className="text-3xl font-bold text-stone-900">{uniqueRegions.length}</div>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="text-sm text-stone-500 mb-1">Product</div>
              <div className="text-3xl font-bold text-stone-900 truncate">{productName}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {uniqueRegions.map((region) => (
            <Link
              key={region.slug}
              href={`/region/${region.slug}`}
              className="bg-white rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all p-8 block"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                    <MapPin size={12} />
                    Region
                  </div>
                  <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{region.name}</h2>
                  <p className="text-stone-500 mt-2">{region.province}</p>
                </div>
              </div>

              <p className="text-stone-500 leading-relaxed mb-6">{region.description}</p>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                <Package size={14} className="text-emerald-600" />
                <span className="font-medium">{productName}</span>
                <span className="text-stone-400 text-xs">{region.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
