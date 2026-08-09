export const FOOD_CATEGORIES = [
  { value: "burgers", label: "Burgers" },
  { value: "pizza", label: "Pizza" },
  { value: "biryani", label: "Biryani" },
  { value: "rice-bowls", label: "Rice Bowls" },
  { value: "salads", label: "Salads" },
  { value: "wraps", label: "Wraps" },
  { value: "breakfast", label: "Breakfast" },
  { value: "desserts", label: "Desserts" },
  { value: "drinks", label: "Drinks" },
  { value: "snacks", label: "Snacks" },
];

export function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function formatCategoryLabel(value) {
  const normalized = normalizeCategory(value);
  const match = FOOD_CATEGORIES.find(
    (category) => category.value === normalized,
  );

  if (match) {
    return match.label;
  }

  return value || "Uncategorized";
}
