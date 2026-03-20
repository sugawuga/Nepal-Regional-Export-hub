import regionsData from '../regions.json';

export type RegionSeed = {
  name: string;
  province: string;
  description: string;
  is_verified: boolean;
  coordinates?: [number, number];
  location: { type: 'Point'; coordinates: [number, number] };
};

export type ProductSeed = {
  name: string;
  slug: string;
};

export type RegionProductSeed = {
  regionName: string;
  productName: string;
  description: string;
  category: string;
  price: number;
};

const DEFAULT_COORDINATES: [number, number] = [84.1240, 28.3949];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
  coordinates?: [number, number];
}>;

export function getSeedRegions(): RegionSeed[] {
  return DISTRICT_SEEDS.map((info) => {
    const name = info.name;
    const coords = info.coordinates || DEFAULT_COORDINATES;

    return {
      name,
      province: info.province,
      description: info.description,
      is_verified: false,
      coordinates: coords,
      location: { type: 'Point', coordinates: coords },
    };
  });
}

export function getSeedProducts(): ProductSeed[] {
  const seen = new Set<string>();
  for (const info of DISTRICT_SEEDS) {
    for (const exportName of info.exports || []) {
      seen.add(normalizeExport(exportName).name.toLowerCase());
    }
  }

  return Array.from(seen)
    .sort()
    .map((name) => ({
      name,
      slug: slugify(name),
    }));
}

export function getSeedRegionProducts(): RegionProductSeed[] {
  return DISTRICT_SEEDS.flatMap((info) =>
    (info.exports || []).map((exportName) => {
      const normalized = normalizeExport(exportName);
      return {
        regionName: info.name,
        productName: normalized.name,
        description: `High-quality ${normalized.name} sourced from ${info.name}.`,
        category: normalized.category,
        price: normalized.price,
      };
    })
  );
}
