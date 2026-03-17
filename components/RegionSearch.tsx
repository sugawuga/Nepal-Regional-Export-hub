'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, MapPin } from 'lucide-react';

interface Region {
  _id: string;
  name: string;
  description: string;
  exports: { name: string }[];
}

interface RegionSearchProps {
  initialRegions: Region[];
}

const FALLBACK_DISTRICTS = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Kaski", "Ilam", "Jhapa", "Morang", 
  "Sunsari", "Chitwan", "Rupandehi", "Banke", "Surkhet", "Kailali", "Kanchanpur", 
  "Mustang", "Manang", "Solukhumbu", "Gorkha", "Dhading", "Nuwakot", "Kavrepalanchok",
  "Sindhupalchok", "Dolakha", "Ramechhap", "Sindhuli", "Makwanpur", "Rautahat", "Bara", "Parsa"
];

export default function RegionSearch({ initialRegions }: RegionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchSuggestions = () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      const query = searchQuery.toLowerCase();

      // 1. Match Region Names
      const nameMatches = initialRegions
        .filter(r => r.name.toLowerCase().includes(query))
        .map(r => r.name);

      // 2. Match Export/Product Names
      const productMatches = initialRegions
        .flatMap(r => r.exports)
        .filter(e => e.name.toLowerCase().includes(query))
        .map(e => e.name);

      // 3. Match from Fallback Districts (Locations)
      const locationMatches = FALLBACK_DISTRICTS.filter(d => 
        d.toLowerCase().includes(query)
      );

      // Combine and deduplicate
      const allSuggestions = Array.from(new Set([
        ...nameMatches,
        ...productMatches,
        ...locationMatches
      ]));

      setSuggestions(allSuggestions.slice(0, 8));
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, initialRegions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
      <form 
        className="max-w-md mx-auto relative mb-20" 
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSearchSubmit}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search regions or products..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg shadow-sm"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {suggestions.map((suggestion, idx) => {
              const isLocal = initialRegions.some(r => r.name.toLowerCase() === suggestion.toLowerCase());
              const isProduct = initialRegions.some(r => r.exports.some(e => e.name.toLowerCase() === suggestion.toLowerCase()));
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    // We need to wait for state update or just pass the value
                    setTimeout(() => handleSearchSubmit(), 0);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-stone-50 flex items-center justify-between text-stone-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isProduct ? (
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </div>
                    ) : (
                      <MapPin size={16} className={isLocal ? "text-emerald-500" : "text-stone-300"} />
                    )}
                    <span className="font-medium">{suggestion}</span>
                  </div>
                  {isLocal && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Region
                    </span>
                  )}
                  {isProduct && !isLocal && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Product
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </form>

      {/* Regions Grid */}
      <section className="px-6 py-10 max-w-7xl mx-auto" ref={resultsRef}>
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
