import Link from 'next/link';
import { ArrowLeft, MapPin, Package, Tag } from 'lucide-react';
import { connectDB, Region as RegionModel } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ExportRegion {
  name: string;
  province: string;
  slug: string;
}

interface CommodityGroup {
  name: string;
  slug: string;
  regions: ExportRegion[];
}

function slugifyExportName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function ExportsPage() {
  await connectDB();

  const regions = await RegionModel.find().lean();
  const commodityMap = new Map<string, CommodityGroup>();

  for (const region of regions as any[]) {
    const exportNames = Array.isArray(region.exports)
      ? region.exports.map((item: any) => item?.name).filter(Boolean)
      : [];

    for (const exportName of exportNames) {
      const key = String(exportName).trim().toLowerCase();
      if (!key) continue;

      const displayName = String(exportName).trim();
      if (!commodityMap.has(key)) {
        commodityMap.set(key, {
          name: displayName,
          slug: slugifyExportName(displayName),
          regions: [],
        });
      }

      const current = commodityMap.get(key)!;
      const regionName = String(region.name || '').trim();
      if (!regionName) continue;

      if (!current.regions.some((entry) => entry.name.toLowerCase() === regionName.toLowerCase())) {
        current.regions.push({
          name: regionName,
          province: String(region.province || 'Nepal'),
          slug: regionName
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        });
      }
    }
  }

  const commodityGroups = Array.from(commodityMap.values()).sort(
    (a, b) => b.regions.length - a.regions.length || a.name.localeCompare(b.name)
  );

  const totalRegions = new Set((regions as any[]).map((region) => String(region.name).toLowerCase())).size;
  const totalCommodities = commodityGroups.length;
  const topCommodity = commodityGroups[0];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      <section className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-500 text-sm shadow-sm">
            <Package size={16} className="text-emerald-600" />
            Exports Directory
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            Browse exports by commodity
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-stone-900 leading-[0.95] mb-6">
            Exports
          </h1>
          <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mb-10">
            Explore every export commodity and the regions that produce it across Nepal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="text-sm text-stone-500 mb-1">Regions</div>
              <div className="text-3xl font-bold text-stone-900">{totalRegions}</div>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="text-sm text-stone-500 mb-1">Commodity Types</div>
              <div className="text-3xl font-bold text-stone-900">{totalCommodities}</div>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
              <div className="text-sm text-stone-500 mb-1">Most Exported</div>
              <div className="text-2xl font-bold text-stone-900 truncate">
                {topCommodity ? topCommodity.name : '—'}
              </div>
              {topCommodity && (
                <div className="text-sm text-stone-500 mt-1">{topCommodity.regions.length} regions</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-14">
            {commodityGroups.map((commodity) => (
              <Link
                key={commodity.slug}
                href={`/exports/${commodity.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm"
              >
                <Tag size={14} />
                {commodity.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {commodityGroups.map((commodity) => {
            const visibleRegions = commodity.regions.slice(0, 8);
            const remainingCount = commodity.regions.length - visibleRegions.length;

            return (
              <Link key={commodity.slug} href={`/exports/${commodity.slug}`} className="block">
                <article
                  id={commodity.slug}
                  className="bg-white rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all p-8 scroll-mt-28"
                >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                      <Package size={12} />
                      Commodity
                    </div>
                    <h2 className="text-3xl font-bold text-stone-900 tracking-tight">{commodity.name}</h2>
                    <p className="text-stone-500 mt-2">
                      Exported by {commodity.regions.length} region{commodity.regions.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 whitespace-nowrap">
                    {commodity.regions.length} listings
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {visibleRegions.map((region) => (
                    <span
                      key={region.slug}
                      className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700"
                    >
                      <MapPin size={14} className="text-emerald-600" />
                      <span className="font-medium">{region.name}</span>
                      <span className="text-stone-400 text-xs">{region.province}</span>
                    </span>
                  ))}
                  {remainingCount > 0 && (
                    <div className="inline-flex items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-2 text-sm text-stone-500">
                      +{remainingCount} more
                    </div>
                  )}
                </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
