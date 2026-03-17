'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

interface Region {
  _id: string;
  name: string;
  description: string;
  exports: { name: string }[];
}

interface RegionSearchProps {
  initialRegions: Region[];
}

export default function RegionSearch({ initialRegions }: RegionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = initialRegions.filter((region) => {
    const query = searchQuery.toLowerCase();
    return (
      region.name.toLowerCase().includes(query) ||
      region.description.toLowerCase().includes(query) ||
      region.exports.some((exp) => exp.name.toLowerCase().includes(query))
    );
  });

  return (
    <>
      {/* Search Input in Hero Section (conceptual, we'll pass the state up or just keep it here) */}
      <div className="max-w-md mx-auto relative mb-20">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search regions or products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg shadow-sm"
        />
      </div>

      {/* Regions Grid */}
      <section className="px-6 py-10 max-w-7xl mx-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">
            {searchQuery ? `Search Results (${filteredRegions.length})` : 'Featured Regions'}
          </h3>
          
          {filteredRegions.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
              <p className="text-stone-400 text-lg">No regions found matching &quot;{searchQuery}&quot;</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-emerald-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredRegions.map((region) => (
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
    </>
  );
}
