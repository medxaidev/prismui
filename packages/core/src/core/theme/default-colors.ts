import type { PrismUIColorFamilies } from "./types";

/**
 * Default Color Families
 *
 * 12 color families with 10 shades each
 * Color values are carefully curated for accessibility and visual harmony
 *
 * Structure:
 * - Core Colors (6): blue, cyan, green, yellow, violet, red
 * - Extended Colors (5): indigo, purple, pink, orange, teal
 * - Neutral Colors (1): gray
 *
 * Note: Users can define their own color families (e.g., 'brand', 'accent')
 * These are recommendations, not constraints
 */
export const defaultColorFamilies = {
  // ========== Core Colors ==========
  blue: {
    50: "#E1F5FE",
    100: "#CDE9FD",
    200: "#9CD0FC",
    300: "#6BB1F8",
    400: "#4594F1",
    500: "#0C68E9",
    600: "#0850C8",
    700: "#063BA7",
    800: "#032987",
    900: "#021D6F",
  },

  cyan: {
    50: "#DFFEF3",
    100: "#CAFDF5",
    200: "#96FBF3",
    300: "#61F3F3",
    400: "#3ADBE8",
    500: "#00B8D9",
    600: "#008FBA",
    700: "#006C9C",
    800: "#004D7D",
    900: "#003768",
  },

  green: {
    50: "#EAFEE4",
    100: "#D3FCD2",
    200: "#A6F9AC",
    300: "#77ED8B",
    400: "#53DC78",
    500: "#22C55E",
    600: "#18A95C",
    700: "#118D57",
    800: "#0A724F",
    900: "#065E49",
  },

  yellow: {
    50: "#FFFAE0",
    100: "#FFF5CC",
    200: "#FFE799",
    300: "#FFD666",
    400: "#FFC63F",
    500: "#FFAB00",
    600: "#DB8B00",
    700: "#B76E00",
    800: "#935400",
    900: "#7A4100",
  },

  violet: {
    50: "#F8E6FF",
    100: "#EFD6FF",
    200: "#DCADFF",
    300: "#C684FF",
    400: "#B166FF",
    500: "#8E33FF",
    600: "#6E25DB",
    700: "#5119B7",
    800: "#391093",
    900: "#27097A",
  },

  red: {
    50: "#FFF4E6",
    100: "#FFE9D5",
    200: "#FFCEAC",
    300: "#FFAC82",
    400: "#FF8B63",
    500: "#FF5630",
    600: "#DB3723",
    700: "#B71D18",
    800: "#930F14",
    900: "#7A0916",
  },

  // ========== Extended Colors ==========
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },

  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },

  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },

  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  // ========== Neutral Colors ==========
  gray: {
    50: "#FCFDFD",
    100: "#F9FAFB",
    200: "#F4F6F8",
    300: "#DFE3E8",
    400: "#C4CDD5",
    500: "#919EAB",
    600: "#637381",
    700: "#454F5B",
    800: "#1C252E",
    900: "#141A21",
  },
} satisfies PrismUIColorFamilies;
