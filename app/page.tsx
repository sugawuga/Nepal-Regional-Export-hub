import { eden } from '@/lib/eden';
import Link from 'next/link';
import { MapPin, ArrowRight, Search } from 'lucide-react';

export default async function Home() {
  const { data: regions, error } = await eden.api.regions.get();
  const regionsArray = Array.isArray(regions) ? regions : [];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Live Export Network
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-stone-900">
          Nepal Regional <br/><span className="text-emerald-700 italic font-serif">Export Hub</span>
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Discover authentic local produce, handicrafts, and raw materials directly from the source. Geospatially verified and globally available.
        </p>
        
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Search regions or products..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg shadow-sm"
          />
        </div>
      </section>

      {/* Map & Regions Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        {/* Interactive Map Placeholder */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 sticky top-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <MapPin className="text-emerald-600" /> Source Map
          </h3>
          <div className="aspect-[4/3] bg-stone-50 rounded-3xl overflow-hidden relative border border-stone-200">
            {/* High-quality SVG Map of Nepal (Abstracted) */}
            <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-sm">
              <path 
                d="M100,250 Q200,300 300,280 T500,250 T700,200 L750,150 Q650,100 550,120 T350,100 T150,150 Z" 
                fill="#E2E8F0" 
                stroke="#CBD5E1" 
                strokeWidth="2"
              />
              {/* Region Nodes */}
              {regionsArray.map((region, i) => {
                // Map coordinates to SVG space (rough approximation for visual)
                const cx = (region.location.coordinates[0] - 80) * 80;
                const cy = 400 - ((region.location.coordinates[1] - 26) * 80);
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={cx} cy={cy} r="16" className="fill-emerald-500/20 group-hover:fill-emerald-500/40 transition-colors animate-pulse" />
                    <circle cx={cx} cy={cy} r="6" className="fill-emerald-600 stroke-white stroke-2" />
                    <text x={cx} y={cy - 20} className="text-sm font-medium fill-stone-700 text-center opacity-0 group-hover:opacity-100 transition-opacity" textAnchor="middle">
                      {region.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Region List */}
        <div className="space-y-6">
          <h3 className="text-3xl font-bold mb-8">Featured Regions</h3>
          {error ? (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl">Unable to connect to the database.</div>
          ) : (
            regionsArray.map((region) => (
              <Link href={`/region/${region.name.toLowerCase()}`} key={region._id}>
                <div className="group bg-white p-8 rounded-3xl border border-stone-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all cursor-pointer mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-2xl font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">{region.name}</h4>
                    <div className="bg-stone-100 p-2 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors text-stone-400">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                  <p className="text-stone-500 mb-6 leading-relaxed">{region.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {region.exports.slice(0, 3).map((exp: any, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-600">
                        {exp.name}
                      </span>
                    ))}
                    {region.exports.length > 3 && (
                      <span className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-500">
                        +{region.exports.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
