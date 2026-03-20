'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

import RegionsTab from './admin/RegionsTab';
import ProductsTab from './admin/ProductsTab';
import InquiriesTab from './admin/InquiriesTab';

export default function AdminDashboard({
  initialRegions,
  initialProducts,
  initialInquiries,
}: {
  initialRegions: Region[];
  initialProducts: ProductRow[];
  initialInquiries: InquiryRow[];
}) {
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [inquiries, setInquiries] = useState<InquiryRow[]>(initialInquiries);
  const [activeTab, setActiveTab] = useState<'regions' | 'products' | 'inquiries'>('regions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const verified = regions.filter((region) => region.is_verified).length;
    return {
      regions: regions.length,
      verified,
      products: products.length,
      inquiries: inquiries.length,
    };
  }, [regions, products.length, inquiries.length]);

  const requestJson = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await fetch(input, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Request failed');
    }

    return data;
  };

  const reloadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsData, productsData, inquiriesData] = await Promise.all([
        requestJson('/api/regions'),
        requestJson('/api/products'),
        requestJson('/api/admin/inquiries'),
      ]);
      setRegions(Array.isArray(regionsData) ? regionsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to reload data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-800 font-sans selection:bg-emerald-200">
      <section className="pt-28 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors font-medium">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-500 text-sm shadow-sm">
            <ShieldCheck size={16} className="text-emerald-600" />
            Admin Dashboard
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
            <div className="text-sm text-stone-500 mb-1">Regions</div>
            <div className="text-3xl font-bold text-stone-900">{summary.regions}</div>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
            <div className="text-sm text-stone-500 mb-1">Products</div>
            <div className="text-3xl font-bold text-stone-900">{summary.products}</div>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
            <div className="text-sm text-stone-500 mb-1">Verified Regions</div>
            <div className="text-3xl font-bold text-stone-900">{summary.verified}</div>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm">
            <div className="text-sm text-stone-500 mb-1">Inquiries</div>
            <div className="text-3xl font-bold text-stone-900">{summary.inquiries}</div>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8 xl:hidden">
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${activeTab === 'regions' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
          >
            Regions
          </button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-3 rounded-full font-semibold transition-colors ${activeTab === 'products' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
            Products
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`px-5 py-3 rounded-full font-semibold transition-colors ${activeTab === 'inquiries' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
            Inquiries
          </button>
          <button
            onClick={reloadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">
        <aside className="hidden xl:block sticky top-28 self-start">
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-4">
            <div className="px-4 py-3 mb-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Admin Menu</div>
              <div className="text-sm text-stone-700">Manage content</div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('regions')}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition-colors ${activeTab === 'regions' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:text-emerald-700'}`}
              >
                <span>Regions</span>
                <span className="text-xs opacity-70">{regions.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition-colors ${activeTab === 'products' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:text-emerald-700'}`}
              >
                <span>Products</span>
                <span className="text-xs opacity-70">{products.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition-colors ${activeTab === 'inquiries' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:text-emerald-700'}`}
              >
                <span>Inquiries</span>
                <span className="text-xs opacity-70">{inquiries.length}</span>
              </button>
            </div>
            <button
              onClick={reloadData}
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Refresh
            </button>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">
          {activeTab === 'regions' && <RegionsTab regions={regions} products={products} reloadData={reloadData} />}
          {activeTab === 'products' && <ProductsTab regions={regions} products={products} reloadData={reloadData} />}
          {activeTab === 'inquiries' && <InquiriesTab inquiries={inquiries} />}
        </div>
      </section>
    </div>
  );
}
