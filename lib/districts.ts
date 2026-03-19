export interface DistrictInfo {
  name: string;
  province: string;
  exports: string[];
  description: string;
  municipalities?: string[];
  livePois?: { name: string; type: string }[];
}

export const DISTRICT_DATA: Record<string, DistrictInfo> = {
  "Kathmandu": {
    name: "Kathmandu",
    province: "Bagmati",
    exports: ["Handicrafts", "Pashmina", "IT Services", "Garments"],
    description: "The capital city and economic hub, famous for traditional crafts and modern services."
  },
  "Lalitpur": {
    name: "Lalitpur",
    province: "Bagmati",
    exports: ["Wood Carvings", "Metal Crafts", "Textiles"],
    description: "A historic city known for its cultural heritage and traditional crafts."
  },
  "Bhaktapur": {
    name: "Bhaktapur",
    province: "Bagmati",
    exports: ["Pottery", "Juju Dhau", "Wooden Masks"],
    description: "Renowned for its pottery and the famous 'King Yogurt' (Juju Dhau)."
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
  },
  "Jhapa": {
    name: "Jhapa",
    province: "Koshi",
    exports: ["Tea", "Rice", "Betel Nut"],
    description: "The easternmost district, a major agricultural producer and gateway to India."
  },
  "Chitwan": {
    name: "Chitwan",
    province: "Bagmati",
    exports: ["Poultry", "Honey", "Tourism"],
    description: "Famous for its national park and as a leading producer of poultry and honey."
  },
  "Banke": {
    name: "Banke",
    province: "Lumbini",
    exports: ["Herbs", "Leather", "Essential Oils"],
    description: "A key trading hub in the west with significant forest-based industries."
  },
  "Morang": {
    name: "Morang",
    province: "Koshi",
    exports: ["Jute", "Sugar", "Garments"],
    description: "One of Nepal's oldest industrial districts with diverse manufacturing."
  }
};
