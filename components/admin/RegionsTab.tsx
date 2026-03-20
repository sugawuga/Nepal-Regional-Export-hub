'use client';

import React, { useMemo, useState } from 'react';
import { Edit3, Loader2, MapPin, Package, Save, Search, ShieldCheck, Trash2, X } from 'lucide-react';

const emptyRegionForm: RegionFormState = {
  name: '',
  province: '',
  description: '',
  coordinates: '84.1240, 28.3949',
  is_verified: false,
};

export default function RegionsTab({
  regions,
  products,
  reloadData,
}: {
  regions: Region[];
  products: ProductRow[];
  reloadData: () => Promise<void>;
}) {
  const [regionQuery, setRegionQuery] = useState('');
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [regionForm, setRegionForm] = useState<RegionFormState>(emptyRegionForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRegions = useMemo(() => {
    const q = regionQuery.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((region) =>
      [region.name, region.province, region.description].some((value) => value?.toLowerCase().includes(q))
    );
  }, [regions, regionQuery]);

  const resetRegionForm = () => {
    setEditingRegionId(null);
    setRegionForm(emptyRegionForm);
    setError(null);
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
                {products.filter((product) => product.regionId === region._id).map((product) => (
                  <span key={product.exportId} className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
                    <Package size={14} className="text-emerald-600" />
                    {product.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {filteredRegions.length === 0 && <div className="text-center text-stone-500 py-12">No regions found.</div>}
        </div>
      </div>
    </div>
  );
}
