export interface CategoryColor {
  id: string;
  label: string;
  hex: string;
  badgeClass: string;
}

export const CATEGORY_COLORS: CategoryColor[] = [
  { id: "technology", label: "Technology", hex: "#1e40af", badgeClass: "bg-blue-100 text-blue-800" },
  { id: "environment", label: "Environment", hex: "#059669", badgeClass: "bg-emerald-100 text-emerald-800" },
  { id: "business", label: "Business", hex: "#7c3aed", badgeClass: "bg-violet-100 text-violet-800" },
  { id: "science", label: "Science", hex: "#ea580c", badgeClass: "bg-orange-100 text-orange-800" },
  { id: "sports", label: "Sports", hex: "#dc2626", badgeClass: "bg-red-100 text-red-800" },
  { id: "entertainment", label: "Entertainment", hex: "#db2777", badgeClass: "bg-pink-100 text-pink-800" },
  { id: "politics", label: "Politics", hex: "#9333ea", badgeClass: "bg-purple-100 text-purple-800" },
  { id: "health", label: "Health", hex: "#16a34a", badgeClass: "bg-green-100 text-green-800" },
  { id: "education", label: "Education", hex: "#0891b2", badgeClass: "bg-cyan-100 text-cyan-800" },
  { id: "crime", label: "Crime", hex: "#991b1b", badgeClass: "bg-rose-100 text-rose-800" },
  { id: "weather", label: "Weather", hex: "#0284c7", badgeClass: "bg-sky-100 text-sky-800" },
  { id: "travel", label: "Travel", hex: "#65a30d", badgeClass: "bg-lime-100 text-lime-800" },
];

export const DEFAULT_CATEGORY_COLOR = {
  hex: "#6b7280",
  badgeClass: "bg-gray-100 text-gray-800"
};

export function getCategoryColor(categoryId: string): CategoryColor | null {
  return CATEGORY_COLORS.find(cat => cat.id.toLowerCase() === categoryId.toLowerCase()) || null;
}

export function getCategoryHex(categoryId: string): string {
  const category = getCategoryColor(categoryId);
  return category?.hex || DEFAULT_CATEGORY_COLOR.hex;
}

export function getCategoryBadgeClass(categoryId: string): string {
  const category = getCategoryColor(categoryId);
  return category?.badgeClass || DEFAULT_CATEGORY_COLOR.badgeClass;
} 