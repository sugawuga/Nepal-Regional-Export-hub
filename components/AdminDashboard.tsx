'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

type Region = {
  _id: string;
  name: string;
  province: string;
  description: string;
  is_verified?: boolean;
  location?: { coordinates?: [number, number] };
  exports: {
    _id: string;
    name: string;
    description: string;
    category: string;
    price: number;
  }[];
};

type ProductRow = {
  regionId: string;
  regionName: string;
  regionProvince: string;
  exportId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  slug: string;
};

type RegionFormState = {
  name: string;
  province: string;
  description: string;
  coordinates: string;
  is_verified: boolean;
};

type ProductFormState = {
  regionId: string;
  name: string;
  description: string;
  category: string;
  price: string;
};

const emptyRegionForm: RegionFormState = {
  name: '',
  province: '',
  description: '',
  coordinates: '84.1240, 28.3949',
  is_verified: false,
};

const emptyProductForm: ProductFormState = {
  regionId: '',
  name: '',
  description: '',
  category: 'Local Specialty',
  price: '',
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProductRows(regions: Region[]): ProductRow[] {
  return regions.flatMap((region) =>
    (region.exports || []).map((exp) => ({
      regionId: region._id,
      regionName: region.name,
      regionProvince: region.province,
      exportId: exp._id,
      name: exp.name,
      description: exp.description,
      category: exp.category,
      price: exp.price,
      slug: slugify(exp.name),
    }))
  );
}

export default function AdminDashboard({ initialRegions }: { initialRegions: Region[] }) {
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [activeTab, setActiveTab] = useState<'regions' | 'products'>('regions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionQuery, setRegionQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<{ regionId: string; exportId: string } | null>(null);
  const [regionForm, setRegionForm] = useState<RegionFormState>(emptyRegionForm);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);

  const products = useMemo(() => buildProductRows(regions), [regions]);

  const filteredRegions = useMemo(() => {
    const q = regionQuery.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((region) =>
      [region.name, region.province, region.description].some((value) => value?.toLowerCase().includes(q))
    );
  }, [regions, regionQuery]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.name, product.category, product.regionName, product.regionProvince, product.description]
        .some((value) => value?.toLowerCase().includes(q))
    );
  }, [products, productQuery]);

  const selectedRegionProducts = useMemo(
    () => products.filter((product) => product.regionId === productForm.regionId),
    [products, productForm.regionId]
  );

  const summary = useMemo(() => {
    const verified = regions.filter((region) => region.is_verified).length;
    return {
      regions: regions.length,
      verified,
      products: products.length,
    };
  }, [regions, products.length]);

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
    const data = await requestJson('/api/regions');
    setRegions(Array.isArray(data) ? data : []);
  };

  const resetRegionForm = () => {
    setEditingRegionId(null);
    setRegionForm(emptyRegionForm);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
  };

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const [lngRaw, latRaw] = regionForm.coordinates.split(',').map((part) => part.trim());
      const coordinates: [number, number] = [Number(lngRaw), Number(latRaw)];
      const payload = {
        name: regionForm.name,
        province: regionForm.province,
        description: regionForm.description,
        is_verified: regionForm.is_verified,
        coordinates: coordinates.every((value) => Number.isFinite(value)) ? coordinates : [84.1240, 28.3949],
      };

      if (editingRegionId) {
        await requestJson(`/api/admin/regions/${editingRegionId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await requestJson('/api/admin/regions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await reloadData();
      resetRegionForm();
    } catch (err: any) {
      setError(err?.message || 'Unable to save region');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.regionId) {
      setError('Select a region first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price || 0),
      };

      if (editingProduct) {
        await requestJson(`/api/admin/regions/${editingProduct.regionId}/exports/${editingProduct.exportId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await requestJson(`/api/admin/regions/${productForm.regionId}/exports`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      await reloadData();
      resetProductForm();
    } catch (err: any) {
      setError(err?.message || 'Unable to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    if (!confirm('Delete this region and all of its products?')) return;
    setLoading(true);
    setError(null);
    try {
      await requestJson(`/api/admin/regions/${regionId}`, { method: 'DELETE' });
      await reloadData();
      if (editingRegionId === regionId) resetRegionForm();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete region');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (regionId: string, exportId: string) => {
    if (!confirm('Delete this product?')) return;
    setLoading(true);
    setError(null);
    try {
      await requestJson(`/api/admin/regions/${regionId}/exports/${exportId}`, { method: 'DELETE' });
      await reloadData();
      if (editingProduct?.regionId === regionId && editingProduct.exportId === exportId) resetProductForm();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete product');
    } finally {
      setLoading(false);
    }
  };

  const startEditRegion = (region: Region) => {
    setEditingRegionId(region._id);
    const coords = region.location?.coordinates || [84.1240, 28.3949];
    setRegionForm({
      name: region.name,
      province: region.province,
      description: region.description,
      coordinates: `${coords[0]}, ${coords[1]}`,
      is_verified: !!region.is_verified,
    });
    setActiveTab('regions');
  };

  const startEditProduct = (product: ProductRow) => {
    setEditingProduct({ regionId: product.regionId, exportId: product.exportId });
    setProductForm({
      regionId: product.regionId,
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
    });
    setActiveTab('products');
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 rounded-full font-semibold transition-colors ${activeTab === 'products' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}
          >
            Products
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

      <section className="px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className={`space-y-8 ${activeTab === 'regions' ? '' : 'hidden'} xl:block`}>
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">{editingRegionId ? 'Edit Region' : 'Add Region'}</h2>
                <p className="text-stone-500 mt-1">Create or update region information.</p>
              </div>
              {editingRegionId && (
                <button onClick={resetRegionForm} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900">
                  <X size={16} />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleRegionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={regionForm.name} onChange={(e) => setRegionForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Region name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
                <input value={regionForm.province} onChange={(e) => setRegionForm((prev) => ({ ...prev, province: e.target.value }))} placeholder="Province" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
              </div>
              <textarea value={regionForm.description} onChange={(e) => setRegionForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={4} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
              <input value={regionForm.coordinates} onChange={(e) => setRegionForm((prev) => ({ ...prev, coordinates: e.target.value }))} placeholder="Longitude, Latitude" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
              <label className="flex items-center gap-3 text-sm text-stone-600">
                <input type="checkbox" checked={regionForm.is_verified} onChange={(e) => setRegionForm((prev) => ({ ...prev, is_verified: e.target.checked }))} />
                Verified export hub
              </label>

              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-white font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editingRegionId ? 'Save Region' : 'Create Region'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Regions</h2>
                <p className="text-stone-500 mt-1">View, edit, or delete region records.</p>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input value={regionQuery} onChange={(e) => setRegionQuery(e.target.value)} placeholder="Search regions" className="w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div className="space-y-4 max-h-[720px] overflow-auto pr-1">
              {filteredRegions.map((region) => (
                <div key={region._id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-stone-500 text-sm">
                        <MapPin size={14} />
                        <span>{region.province}</span>
                        {region.is_verified && <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"><ShieldCheck size={10} /> Verified</span>}
                      </div>
                      <h3 className="text-xl font-bold text-stone-900">{region.name}</h3>
                      <p className="text-stone-500 mt-2 leading-relaxed">{region.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <button onClick={() => startEditRegion(region)} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button onClick={() => handleDeleteRegion(region._id)} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(region.exports || []).map((exp, index) => (
                      <span key={`${region._id}-export-chip-${index}`} className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                        <Package size={14} className="text-emerald-600" />
                        {exp.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {filteredRegions.length === 0 && <div className="text-center text-stone-500 py-12">No regions found.</div>}
            </div>
          </div>
        </div>

        <div className={`space-y-8 ${activeTab === 'products' ? '' : 'hidden'} xl:block`}>
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <p className="text-stone-500 mt-1">Products are stored inside a region.</p>
              </div>
              {editingProduct && (
                <button onClick={resetProductForm} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900">
                  <X size={16} />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <select value={productForm.regionId} onChange={(e) => setProductForm((prev) => ({ ...prev, regionId: e.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400">
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>{region.name}</option>
                ))}
              </select>

              {productForm.regionId && (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Existing products in this region</h3>
                      <p className="text-xs text-stone-500 mt-1">Select one to edit, or continue below to add a new product.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{selectedRegionProducts.length}</span>
                  </div>

                  {selectedRegionProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-5 text-sm text-stone-500">
                      No products are stored in this region yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-auto pr-1">
                      {selectedRegionProducts.map((product) => (
                        <div key={`${product.regionId}-${product.exportId}`} className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div>
                            <div className="font-semibold text-stone-900">{product.name}</div>
                            <div className="text-xs text-stone-500 mt-1">{product.category} • Price: {product.price}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditProduct(product)}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700"
                          >
                            <Edit3 size={12} />
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
                <input value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Category" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
              </div>
              <input value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />
              <textarea value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Product description" rows={4} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-400" />

              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-white font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {editingProduct ? 'Save Product' : 'Create Product'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Products</h2>
                <p className="text-stone-500 mt-1">View, edit, or delete all products.</p>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search products" className="w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div className="space-y-4 max-h-[720px] overflow-auto pr-1">
              {filteredProducts.map((product) => (
                <div key={`${product.regionId}-${product.exportId}`} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-stone-500 text-sm">
                        <MapPin size={14} />
                        <span>{product.regionName}</span>
                        <span className="text-stone-300">•</span>
                        <span>{product.regionProvince}</span>
                      </div>
                      <h3 className="text-xl font-bold text-stone-900">{product.name}</h3>
                      <p className="text-stone-500 mt-2 leading-relaxed">{product.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <Link href={`/exports/${product.slug}`} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                        View
                      </Link>
                      <button onClick={() => startEditProduct(product)} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.regionId, product.exportId)} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-2xl bg-white border border-stone-200 px-3 py-2 text-sm text-stone-700">{product.category}</span>
                    <span className="inline-flex items-center rounded-2xl bg-white border border-stone-200 px-3 py-2 text-sm text-stone-700">Price: {product.price}</span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && <div className="text-center text-stone-500 py-12">No products found.</div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
