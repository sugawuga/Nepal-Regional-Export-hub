'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit3, Loader2, MapPin, Plus, Search, Trash2, X } from 'lucide-react';

const emptyProductForm: ProductFormState = {
  regionId: '',
  name: '',
  description: '',
  category: 'Local Specialty',
  price: '',
};

export default function ProductsTab({
  regions,
  products,
  reloadData,
}: {
  regions: Region[];
  products: ProductRow[];
  reloadData: () => Promise<void>;
}) {
  const [productQuery, setProductQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<{ exportId: string } | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setError(null);
  };

  const startEditProduct = (product: ProductRow) => {
    setEditingProduct({ exportId: product.exportId });
    setProductForm({
      regionId: product.regionId,
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        regionId: productForm.regionId,
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price || 0),
      };

      if (editingProduct) {
        await requestJson(`/api/admin/products/${editingProduct.exportId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await requestJson('/api/admin/products', {
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

  const handleDeleteProduct = async (regionId: string, exportId: string) => {
    if (!confirm('Delete this product?')) return;
    setLoading(true);
    setError(null);
    try {
      await requestJson(`/api/admin/products/${exportId}`, { method: 'DELETE' });
      await reloadData();
      if (editingProduct?.exportId === exportId) resetProductForm();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {error}
        </div>
      )}
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
                    <div key={product.exportId} className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
                      <div>
                        <div className="font-semibold text-stone-900">{product.name}</div>
                        <div className="text-xs text-stone-500 mt-1">{product.category} &bull; Price: {product.price}</div>
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
            <div key={product.exportId} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-stone-500 text-sm">
                    <MapPin size={14} />
                    <span>{product.regionName}</span>
                    <span className="text-stone-300">&bull;</span>
                    <span>{product.regionProvince}</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">{product.name}</h3>
                  <p className="text-stone-500 mt-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <Link href={`/exports/${product.slug}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                    View
                  </Link>
                  <button onClick={() => startEditProduct(product)} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700">
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteProduct(product.regionId, product.exportId)} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
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
  );
}
