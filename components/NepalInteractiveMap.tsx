'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';

// Reliable GeoJSON source for Nepal (Districts and States)
const NEPAL_GEO_URL = 'https://raw.githubusercontent.com/mesaugat/geoJSON-Nepal/master/nepal-districts-new.geojson';
const NEPAL_GEO_URL_FALLBACK_1 = 'https://raw.githubusercontent.com/mesaugat/geoJSON-Nepal/master/nepal-states.geojson';
const NEPAL_GEO_URL_FALLBACK_2 = 'https://raw.githubusercontent.com/nepal-maps/nepal-geojson/master/districts.json';

export interface DistrictInfo {
  name: string;
  province: string;
  exports: string[];
  description: string;
}

const PROVINCE_FALLBACK: Record<string, Partial<DistrictInfo>> = {
  "1": { province: "Koshi", exports: ["Tea", "Cardamom"], description: "Eastern region known for tea and agriculture." },
  "Koshi": { province: "Koshi", exports: ["Tea", "Cardamom"], description: "Eastern region known for tea and agriculture." },
  "2": { province: "Madhesh", exports: ["Rice", "Sugarcane"], description: "Southern plains, the granary of Nepal." },
  "Madhesh": { province: "Madhesh", exports: ["Rice", "Sugarcane"], description: "Southern plains, the granary of Nepal." },
  "3": { province: "Bagmati", exports: ["Handicrafts", "Services"], description: "Central hub including the capital city." },
  "Bagmati": { province: "Bagmati", exports: ["Handicrafts", "Services"], description: "Central hub including the capital city." },
  "4": { province: "Gandaki", exports: ["Tourism", "Apples"], description: "Mountainous region with high tourism value." },
  "Gandaki": { province: "Gandaki", exports: ["Tourism", "Apples"], description: "Mountainous region with high tourism value." },
  "5": { province: "Lumbini", exports: ["Cement", "Agriculture"], description: "Industrial and agricultural center." },
  "Lumbini": { province: "Lumbini", exports: ["Cement", "Agriculture"], description: "Industrial and agricultural center." },
  "6": { province: "Karnali", exports: ["Herbs", "Apples"], description: "Remote region rich in medicinal herbs." },
  "Karnali": { province: "Karnali", exports: ["Herbs", "Apples"], description: "Remote region rich in medicinal herbs." },
  "7": { province: "Sudurpashchim", exports: ["Timber", "Herbs"], description: "Far-western region with forest resources." },
  "Sudurpashchim": { province: "Sudurpashchim", exports: ["Timber", "Herbs"], description: "Far-western region with forest resources." },
};

const DISTRICT_DATA: Record<string, DistrictInfo> = {
  "Kathmandu": {
    name: "Kathmandu",
    province: "Bagmati",
    exports: ["Handicrafts", "Pashmina", "IT Services", "Garments"],
    description: "The capital city and economic hub, famous for traditional crafts and modern services."
  },
  "Kaski": {
    name: "Kaski",
    province: "Gandaki",
    exports: ["Tourism Services", "Coffee", "Handicrafts"],
    description: "Home to Pokhara, a major tourism hub with growing specialty coffee exports."
  },
  "Ilam": {
    name: "Ilam",
    province: "Koshi",
    exports: ["Orthodox Tea", "Cardamom", "Milk Products"],
    description: "The tea capital of Nepal, producing world-class Himalayan orthodox tea."
  },
  "Mustang": {
    name: "Mustang",
    province: "Gandaki",
    exports: ["Apples", "Apricots", "Mountain Herbs"],
    description: "Famous for high-altitude organic apples and rare medicinal herbs."
  },
  "Rupandehi": {
    name: "Rupandehi",
    province: "Lumbini",
    exports: ["Cement", "Processed Foods", "Tourism"],
    description: "An industrial powerhouse and home to Lumbini, the birthplace of Buddha."
  }
};

const DEFAULT_INFO: DistrictInfo = {
  name: "Nepal",
  province: "All Provinces",
  exports: ["Tea", "Carpets", "Pashmina", "Handicrafts", "Herbs"],
  description: "Hover over a district to see specific regional export data. The map displays all 77 districts of Nepal."
};

export default function NepalInteractiveMap() {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const urls = [NEPAL_GEO_URL, NEPAL_GEO_URL_FALLBACK_1, NEPAL_GEO_URL_FALLBACK_2];
    
    const fetchMapData = async (index: number) => {
      if (index >= urls.length) {
        setError("Failed to fetch map data from all available sources. Please check your connection.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(urls[index], { mode: 'cors' });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        setGeoData(data);
        setLoading(false);
      } catch (err: any) {
        console.error(`Map fetch error (Source ${index + 1}):`, err);
        fetchMapData(index + 1);
      }
    };

    fetchMapData(0);
  }, []);

  if (!mounted) return <div className="h-[600px] w-full bg-stone-100 animate-pulse rounded-[3rem]" />;

  const displayInfo = hoveredDistrict || DEFAULT_INFO;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight">Interactive Export Map</h2>
          <p className="text-stone-500 mt-2 text-lg">Detailed district-level view of Nepal&apos;s export economy.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-stone-600 font-medium">High Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-200"></div>
            <span className="text-sm text-stone-600 font-medium">Emerging</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-4 sm:p-8 border border-stone-200 shadow-2xl shadow-stone-200/50 relative overflow-hidden min-h-[600px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-stone-500 font-medium">Loading geospatial data...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Map Failed to Load</h3>
              <p className="text-stone-500 max-w-xs mx-auto mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-lg"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 5500,
                center: [84.1240, 28.3949]
              }}
              className="w-full h-full"
            >
              <ZoomableGroup center={[84.1240, 28.3949]} zoom={1}>
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const props = geo.properties;
                      // Handle different GeoJSON property naming conventions for both districts and states
                      const districtName = props.DISTRICT || props.name || props.NAME_3 || props.district || props.STATE_NAME || props.province || "Unknown";
                      const provinceId = props.PROVINCE || props.PR_NAME || props.NAME_1 || props.province || props.STATE_NAME;
                      
                      // Try to find data by district name first, then by province name/id
                      const info = DISTRICT_DATA[districtName] || PROVINCE_FALLBACK[provinceId] || PROVINCE_FALLBACK[districtName];
                      const fallback = info || PROVINCE_FALLBACK[provinceId] || {};

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            setHoveredDistrict(info || {
                              name: districtName,
                              province: fallback.province || `Province ${provinceId || 'Unknown'}`,
                              exports: fallback.exports || ["Local Produce"],
                              description: fallback.description || `A key district in Nepal. Regional export data is currently being updated for this area.`
                            });
                          }}
                          onMouseLeave={() => setHoveredDistrict(null)}
                          style={{
                            default: {
                              fill: info ? "#10b981" : "#ecfdf5",
                              stroke: "#065f46",
                              strokeWidth: 0.4,
                              outline: "none",
                              transition: "all 250ms"
                            },
                            hover: {
                              fill: "#059669",
                              stroke: "#064e3b",
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: "pointer"
                            },
                            pressed: {
                              fill: "#047857",
                              outline: "none"
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          )}
          
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md border border-stone-200 px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-stone-500 shadow-sm flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Scroll to Zoom
            </span>
            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Drag to Pan
            </span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayInfo.name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-900 text-white rounded-[3rem] p-10 shadow-2xl h-full flex flex-col border border-stone-800 sticky top-8"
            >
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                    {displayInfo.province}
                  </span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter leading-none">{displayInfo.name}</h3>
              </div>

              <p className="text-stone-400 text-lg leading-relaxed mb-12 flex-grow font-medium">
                {displayInfo.description}
              </p>

              <div className="space-y-6">
                <h4 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Export Commodities
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {displayInfo.exports.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-5 py-2.5 bg-stone-800/50 border border-stone-700/50 rounded-2xl text-sm font-bold text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all duration-300 cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-800/50 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-stone-900 bg-stone-800 flex items-center justify-center text-xs font-black text-stone-500">
                      {i}
                    </div>
                  ))}
                </div>
                <button className="group text-emerald-400 text-sm font-black hover:text-emerald-300 transition-all flex items-center gap-3 uppercase tracking-widest">
                  Details
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
