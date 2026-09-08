import { ImageSourcePropType } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";

export interface SubServiceItem {
  id: string;
  name: string;
  categoryTitle: string;
  image?: ImageSourcePropType;
  iconName: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5" | "Feather";
  iconColor: string;
  iconBg: string;
}

export interface ServiceCategoryGroup {
  id: string;
  title: string;
  shortName: string;
  accentColor: string;
  items: SubServiceItem[];
}

export const ALL_SERVICE_CATEGORIES: ServiceCategoryGroup[] = [
  {
    id: "electrical",
    title: "Electrical & Power",
    shortName: "Electrical",
    accentColor: "#D97706",
    items: [
      {
        id: "e1",
        name: "House Wiring",
        categoryTitle: "Electrical & Power",
        image: require("../../assets/images/House-Wiring.jpg"),
        iconName: "flash",
        iconFamily: "Ionicons",
        iconColor: "#D97706",
        iconBg: "#FEF3C7",
      },
    ],
  },
  {
    id: "plumbing",
    title: "Plumbing & Water Systems",
    shortName: "Plumbing",
    accentColor: "#0284C7",
    items: [
      {
        id: "p1",
        name: "Tanker Pump & Booster",
        categoryTitle: "Plumbing & Water Systems",
        image: require("../../assets/images/images3.jpg"),
        iconName: "water",
        iconFamily: "Ionicons",
        iconColor: "#0284C7",
        iconBg: "#E0F2FE",
      },
      {
        id: "p2",
        name: "Pipe Leak & Line Repair",
        categoryTitle: "Plumbing & Water Systems",
        iconName: "build",
        iconFamily: "Ionicons",
        iconColor: "#0369A1",
        iconBg: "#BAE6FD",
      },
      {
        id: "p3",
        name: "Water Heater (Boiler)",
        categoryTitle: "Plumbing & Water Systems",
        iconName: "flame",
        iconFamily: "Ionicons",
        iconColor: "#EA580C",
        iconBg: "#FFEDD5",
      },
      {
        id: "p4",
        name: "Bathroom & Kitchen Fitting",
        categoryTitle: "Plumbing & Water Systems",
        iconName: "construct",
        iconFamily: "Ionicons",
        iconColor: "#2563EB",
        iconBg: "#EFF6FF",
      },
      {
        id: "p5",
        name: "Faucet & Toilet Repair",
        categoryTitle: "Plumbing & Water Systems",
        iconName: "water-outline",
        iconFamily: "Ionicons",
        iconColor: "#0891B2",
        iconBg: "#CFFAFE",
      },
    ],
  },
  {
    id: "appliances",
    title: "Appliances & Electronics",
    shortName: "Appliances",
    accentColor: "#7C3AED",
    items: [
      {
        id: "a1",
        name: "Washing Machine",
        categoryTitle: "Appliances & Electronics",
        image: require("../../assets/images/washing-machine.jpg"),
        iconName: "sync",
        iconFamily: "Ionicons",
        iconColor: "#2563EB",
        iconBg: "#EFF6FF",
      },
      {
        id: "a2",
        name: "Refrigerator & Freezer",
        categoryTitle: "Appliances & Electronics",
        image: require("../../assets/images/Refrigerator.jpg"),
        iconName: "snow",
        iconFamily: "Ionicons",
        iconColor: "#0284C7",
        iconBg: "#E0F2FE",
      },
      {
        id: "a3",
        name: "TV & Satellite",
        categoryTitle: "Appliances & Electronics",
        image: require("../../assets/images/TV-Satellite.jpg"),
        iconName: "tv",
        iconFamily: "Ionicons",
        iconColor: "#7C3AED",
        iconBg: "#F3E8FF",
      },
      {
        id: "a4",
        name: "Electric Stove (Mitad)",
        categoryTitle: "Appliances & Electronics",
        image: require("../../assets/images/Electric-Stove.jpg"),
        iconName: "restaurant",
        iconFamily: "Ionicons",
        iconColor: "#DC2626",
        iconBg: "#FEE2E2",
      },
      {
        id: "a5",
        name: "Microwave & Oven",
        categoryTitle: "Appliances & Electronics",
        iconName: "microwave",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "#D97706",
        iconBg: "#FEF3C7",
      },
    ],
  },
  {
    id: "carpentry",
    title: "Carpentry & Metalwork",
    shortName: "Carpentry",
    accentColor: "#EA580C",
    items: [
      {
        id: "c1",
        name: "Compound Gate & Welding",
        categoryTitle: "Carpentry & Metalwork",
        image: require("../../assets/images/gate.jpg"),
        iconName: "shield",
        iconFamily: "Ionicons",
        iconColor: "#4B5563",
        iconBg: "#F3F4F6",
      },
      {
        id: "c2",
        name: "Lock & Key",
        categoryTitle: "Carpentry & Metalwork",
        image: require("../../assets/images/Lock-Key.jpg"),
        iconName: "key",
        iconFamily: "Ionicons",
        iconColor: "#D97706",
        iconBg: "#FEF3C7",
      },
      {
        id: "c3",
        name: "Furniture & Woodwork",
        categoryTitle: "Carpentry & Metalwork",
        image: require("../../assets/images/Furniture.jpg"),
        iconName: "hammer",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "#B45309",
        iconBg: "#FEF3C7",
      },
      {
        id: "c4",
        name: "Roof Sheet Repair",
        categoryTitle: "Carpentry & Metalwork",
        image: require("../../assets/images/Roof-Sheet.jpg"),
        iconName: "home",
        iconFamily: "Ionicons",
        iconColor: "#2563EB",
        iconBg: "#EFF6FF",
      },
    ],
  },
  {
    id: "finishing",
    title: "Finishing & Cleaning",
    shortName: "Finishing",
    accentColor: "#16A34A",
    items: [
      {
        id: "f1",
        name: "Wall Painting",
        categoryTitle: "Finishing & Cleaning",
        image: require("../../assets/images/painting.jpg"),
        iconName: "format-paint",
        iconFamily: "MaterialCommunityIcons",
        iconColor: "#0284C7",
        iconBg: "#E0F2FE",
      },
      {
        id: "f2",
        name: "Tile & Granite Repair",
        categoryTitle: "Finishing & Cleaning",
        image: require("../../assets/images/tile.jpg"),
        iconName: "grid",
        iconFamily: "Ionicons",
        iconColor: "#7C3AED",
        iconBg: "#F3E8FF",
      },
      {
        id: "f3",
        name: "Deep Cleaning",
        categoryTitle: "Finishing & Cleaning",
        iconName: "sparkles",
        iconFamily: "Ionicons",
        iconColor: "#16A34A",
        iconBg: "#DCFCE7",
      },
      {
        id: "f4",
        name: "Moving & Loading",
        categoryTitle: "Finishing & Cleaning",
        image: require("../../assets/images/Moving-Loading.jpg"),
        iconName: "car",
        iconFamily: "Ionicons",
        iconColor: "#EA580C",
        iconBg: "#FFEDD5",
      },
    ],
  },
];

/**
 * Normalizes an arbitrary query string (e.g., "Electrical", "Electrical & Power", "plumbing")
 * to the corresponding ServiceCategoryGroup if one matches.
 */
export function findCategoryByQuery(query?: string | null): ServiceCategoryGroup | null {
  if (!query || query === "All") return null;
  const clean = query.trim().toLowerCase();
  return (
    ALL_SERVICE_CATEGORIES.find(
      (c) =>
        c.title.toLowerCase() === clean ||
        c.shortName.toLowerCase() === clean ||
        c.id.toLowerCase() === clean ||
        c.title.toLowerCase().includes(clean) ||
        clean.includes(c.shortName.toLowerCase())
    ) || null
  );
}
