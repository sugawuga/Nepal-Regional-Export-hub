import NepalInteractiveMap from '@/components/NepalInteractiveMap';
import RegionSearch from '@/components/RegionSearch';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let regionsArray: any[] = [];
  let productsArray: any[] = [];
  let error: string | null = null;

  try {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const [regionsRes, productsRes] = await Promise.all([
      fetch(new URL('/api/regions', baseUrl).toString(), { cache: 'no-store' }),
      fetch(new URL('/api/products', baseUrl).toString(), { cache: 'no-store' }),
    ]);

    if (!regionsRes.ok) throw new Error(`Failed to fetch regions (${regionsRes.status})`);
    if (!productsRes.ok) throw new Error(`Failed to fetch products (${productsRes.status})`);

    regionsArray = (await regionsRes.json()) as any[];
    productsArray = (await productsRes.json()) as any[];
  } catch (err: any) {
    error = err?.message ?? 'Failed to load regions';
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      {/* Hero */}
      <section className="pt-32 pb-10 px-6 max-w-7xl mx-auto text-center">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/exports"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors shadow-lg"
          >
            Browse Exports
          </Link>
          <a
            href="#regions"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-stone-300 bg-white text-stone-700 font-semibold hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm"
          >
            Explore Regions
          </a>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-12 bg-white border-y border-stone-200">
        <NepalInteractiveMap />
      </section>

      {/* Search and Regions Section */}
      <section id="regions" className="py-20">
        {error ? (
          <div className="max-w-4xl mx-auto px-6">
            <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-center">
              <p className="font-bold mb-2">Connection Error</p>
              <p>Unable to connect to the database. Please check your connection or try again later.</p>
            </div>
          </div>
        ) : (
          <RegionSearch initialRegions={regionsArray} initialProducts={productsArray} />
        )}
      </section>
    </div>
  );
}
