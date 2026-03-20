import regionsData from '../regions.json';

export interface DistrictInfo {
  name: string;
  province: string;
  exports: string[];
  description: string;
  coordinates?: [number, number];
  municipalities?: string[];
  livePois?: { name: string; type: string }[];
}

export const slugifyDistrictName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const DISTRICT_SEED_DATA = regionsData as DistrictInfo[];

export const DISTRICT_DATA: Record<string, DistrictInfo> = Object.fromEntries(
  DISTRICT_SEED_DATA.map((district) => [district.name, district])
);

export const DISTRICT_NAMES = DISTRICT_SEED_DATA.map((district) => district.name);
