type Region = {
  _id: string;
  name: string;
  province: string;
  description: string;
  is_verified?: boolean;
  location?: { coordinates?: [number, number] };
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

type InquiryRow = {
  _id: string;
  regionId?: string | null;
  productId?: string | null;
  regionName: string;
  regionProvince: string;
  productName?: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  quantity?: string;
  message: string;
  status?: string;
  createdAt?: string;
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
