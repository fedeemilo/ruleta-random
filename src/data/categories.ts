export const CATEGORY_IDS = [
  "pareja",
  "plata",
  "amistad",
  "vida",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  name: string;
  shortName: string;
  color: string;
  ink: string;
  glow: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "pareja",
    name: "Pareja y relaciones",
    shortName: "Pareja",
    color: "#ff4d8d",
    ink: "#fff5f9",
    glow: "rgba(255, 77, 141, 0.45)",
  },
  {
    id: "plata",
    name: "Plata y laburo",
    shortName: "Plata",
    color: "#ffc53d",
    ink: "#2a1d00",
    glow: "rgba(255, 197, 61, 0.4)",
  },
  {
    id: "amistad",
    name: "Amistad y familia",
    shortName: "Amistad",
    color: "#2ee6a8",
    ink: "#04241a",
    glow: "rgba(46, 230, 168, 0.4)",
  },
  {
    id: "vida",
    name: "Vida y sociedad",
    shortName: "Vida",
    color: "#8b7cff",
    ink: "#f6f4ff",
    glow: "rgba(139, 124, 255, 0.45)",
  },
];

export function getCategory(id: CategoryId): Category {
  const category = CATEGORIES.find((item) => item.id === id);
  if (!category) {
    throw new Error(`Categoría desconocida: ${id}`);
  }
  return category;
}

export function getCategoryIndex(id: CategoryId): number {
  return CATEGORIES.findIndex((item) => item.id === id);
}
