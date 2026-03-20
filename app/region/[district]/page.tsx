import { eden } from '@/lib/eden';
import { connectDB, Region as RegionModel } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, MapPin, Package, Tag, Info, Globe, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { DISTRICT_DATA, slugifyDistrictName } from '@/lib/districts';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ district: string }>;
}

interface Region {
  name: string;
  province: string;
  description: string;
  location: { coordinates: number[] };
  exports: {
    name: string;
    description: string;
    category: string;
    price: number | string;
  }[];
}

export default async function RegionPage({ params }: PageProps) {
  const { district } = await params;
  const districtSlug = decodeURIComponent(district);

  // 1. Try to fetch from MongoDB (server-side)
  await connectDB();
  const dbRegion = await RegionModel.findOne({ name: new RegExp(`^${districtSlug.replace(/-/g, ' ')}$`, 'i') }).lean();

  // 2. Fallback to in-memory district data if the DB doesn't have it
  const fallbackData =
    Object.entries(DISTRICT_DATA).find(([, value]) => slugifyDistrictName(value.name) === slugifyDistrictName(districtSlug))?.[1] ||
    DISTRICT_DATA[districtSlug];

  if (!dbRegion && !fallbackData) {
    return notFound();
  }

  // Normalize data
  const region: Region = dbRegion ? {
    name: (dbRegion as any).name,
    province: (dbRegion as any).province,
    description: (dbRegion as any).description,
    location: (dbRegion as any).location,
    exports: (dbRegion as any).exports
  } : {
    name: fallbackData.name,
    province: fallbackData.province,
    description: fallbackData.description,
    location: { coordinates: [84.1240, 28.3949] }, // Default center of Nepal
    exports: fallbackData.exports.map(e => ({
      name: e,
      description: "Regional specialty with high export potential.",
      category: "Local Specialty",
      price: "Market Rate"
    }))
  };

  const isVerified = !!dbRegion;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Network</span>
          </Link>
          <div className="text-sm font-bold uppercase tracking-widest text-stone-400">
            Region Profile / {region.name}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
              {isVerified ? (
                <><ShieldCheck size={14} /> Verified Export Hub</>
              ) : (
                'Regional Profile'
              )}
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-stone-900 leading-[0.9]">
              {region.name}
            </h1>
            <p className="text-2xl text-stone-500 leading-relaxed max-w-2xl">
              {region.description}
            </p>
          </div>
          
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-stone-400">
                <MapPin size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">Geospatial Data</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Coordinates</div>
                  <div className="text-lg font-mono text-stone-700">
                    {region.location.coordinates[1].toFixed(4)}° N, {region.location.coordinates[0].toFixed(4)}° E
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">Status</div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                    {isVerified ? 'Active Hub' : 'Data Pending Verification'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exports Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-stone-200" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">Primary Exports</h2>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {region.exports.map((item: any, idx: number) => (
              <div key={idx} className="group bg-white p-8 rounded-[2.5rem] border border-stone-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-900/5">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors text-stone-400">
                  <Package size={24} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4">{item.name}</h3>
                <p className="text-stone-500 leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Tag size={16} />
                    <span className="text-sm font-medium">Market Value</span>
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {typeof item.price === 'number' ? `$${item.price}` : item.price}<span className="text-sm text-stone-400 font-normal">/unit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Insights */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-10 bg-stone-900 rounded-[3rem] text-white overflow-hidden relative">
            <Globe className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 text-emerald-400">
                <Info size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">Regional Insight</span>
              </div>
              <h3 className="text-3xl font-bold mb-6 tracking-tight">Economic Significance</h3>
              <p className="text-stone-400 leading-relaxed text-lg">
                {region.name} serves as a critical node in Nepal&apos;s trade network. Its unique climatic conditions and traditional expertise contribute significantly to the national export volume, particularly in the {region.exports[0]?.category?.toLowerCase() || 'agricultural'} sector.
              </p>
            </div>
          </div>
          
          <div className="p-10 bg-emerald-700 rounded-[3rem] text-white">
            <div className="flex items-center gap-3 mb-8 text-emerald-200">
              <Package size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Supply Chain</span>
            </div>
            <h3 className="text-3xl font-bold mb-6 tracking-tight">Direct Sourcing</h3>
            <p className="text-emerald-100 leading-relaxed text-lg mb-8">
              We facilitate direct connections with verified producers in {region.name}. Our platform ensures transparency, fair pricing, and quality assurance from the source to the global market.
            </p>
            <button className="px-8 py-4 bg-white text-emerald-800 rounded-2xl font-bold hover:bg-emerald-50 transition-colors">
              Inquire About Supply
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

