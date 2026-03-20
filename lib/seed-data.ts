import regionsData from '../regions.json';

export type RegionSeed = {
  name: string;
  province: string;
  description: string;
  location: { type: 'Point'; coordinates: [number, number] };
  exports: { name: string; description: string; category: string; price: number }[];
};

const DEFAULT_COORDINATES: [number, number] = [84.1240, 28.3949];

// Basic heuristics for category + pricing from a plain export name
function normalizeExport(name: string) {
  const normalized = name.trim();
  const lower = normalized.toLowerCase();

  let category = 'Local Specialty';
  if (lower.includes('tea')) category = 'Beverage';
  else if (lower.includes('herb')) category = 'Herb';
  else if (lower.includes('rice') || lower.includes('cereal')) category = 'Agriculture';
  else if (lower.includes('apple') || lower.includes('fruit')) category = 'Fruit';
  else if (lower.includes('spice') || lower.includes('cardamom')) category = 'Spice';
  else if (lower.includes('pottery') || lower.includes('handicraft') || lower.includes('garment')) category = 'Handicraft';

  const priceBase = 10;
  const price = Math.round((priceBase + normalized.length / 2) * 10) / 10;

  return {
    name: normalized,
    description: `High-quality ${normalized} sourced from the region.`,
    category,
    price,
  };
}

const DISTRICT_SEEDS = regionsData as Array<{
  name: string;
  province: string;
  exports: string[];
  description: string;
}>;

// Provide some approximate coordinates for the districts in regions.json.
// If we don’t know them, fall back to the Nepal center point.
const COORDINATES: Record<string, [number, number]> = {
  Kathmandu: [85.3240, 27.7172],
  Kaski: [83.9856, 28.2096],
  Ilam: [87.9167, 26.9167],
  Mustang: [83.9180, 28.9985],
  Rupandehi: [83.4500, 27.5000],
  Jhapa: [87.8667, 26.6667],
  Chitwan: [84.3542, 27.5417],
  Banke: [81.6167, 28.1000],
  Morang: [87.5000, 26.6667],
};

export function getSeedRegions(): RegionSeed[] {
  return DISTRICT_SEEDS.map((info) => {
    const name = info.name;
    const coords = COORDINATES[name] || DEFAULT_COORDINATES;
    const exportsList = (info.exports || []).map(normalizeExport);

    return {
      name,
      province: info.province,
      description: info.description,
      location: { type: 'Point', coordinates: coords },
      exports: exportsList,
    };
  });
}
