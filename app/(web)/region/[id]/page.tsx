import { eden } from '@/lib/eden';
import { notFound } from 'next/navigation';
import { MapPin, Leaf, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // SEO optimized ISR

export default async function RegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch all regions to find the one matching the ID
  const { data: regions, error } = await eden.api.regions.get();
  
  const regionsArray = Array.isArray(regions) ? regions : [];
  
  if (error || regionsArray.length === 0) {
    return <div className="p-8 text-red-500">Failed to load region data.</div>;
  }

  // Using name as ID for the sake of the demo routing
  const region = regionsArray.find(r => r.name.toLowerCase() === id.toLowerCase());

  if (!region) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-emerald-900 text-emerald-50 py-24 px-6 sm:px-12 lg:px-24">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,80 70,120 100,80 L100,0 L0,0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative max-w-5xl mx-auto z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-100 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-200 text-sm mb-6 backdrop-blur-sm w-fit">
            <MapPin size={16} />
            <span>Region Profile</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-emerald-50">
            {region.name}
          </h1>
          <p className="text-xl md:text-2xl text-emerald-200 max-w-2xl leading-relaxed">
            {region.description}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-24 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-semibold mb-8 text-stone-800 flex items-center gap-3">
              <Leaf className="text-emerald-600" />
              Regional Exports
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {region.exports.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-medium text-stone-800 group-hover:text-emerald-700 transition-colors">{item.name}</h3>
                    <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-stone-600 mb-6 leading-relaxed text-sm">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-semibold text-emerald-700">${item.price}<span className="text-sm text-stone-400 font-normal">/unit</span></span>
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                      Source <Package size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Map */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h3 className="text-lg font-semibold mb-4 text-stone-800">Geospatial Data</h3>
            <div className="aspect-square rounded-2xl bg-stone-100 overflow-hidden relative flex items-center justify-center border border-stone-200">
              {/* Animated SVG Map Placeholder */}
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-600/20">
                <path d="M40,100 Q80,40 160,100 T40,100" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="100" cy="100" r="4" className="fill-emerald-600 animate-ping" />
                <circle cx="100" cy="100" r="4" className="fill-emerald-600" />
              </svg>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur text-xs p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-stone-500">Lat</span>
                  <span className="font-mono text-stone-800">{region.location.coordinates[1].toFixed(4)}° N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Lng</span>
                  <span className="font-mono text-stone-800">{region.location.coordinates[0].toFixed(4)}° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
