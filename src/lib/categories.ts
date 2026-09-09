export const PRODUCT_CATEGORIES = [
  'Skin Care (Face)',
  "24 hour's Day Cream",
  'Day Cream',
  'Night Cream',
  'Face Mask',
  'Face Serum',
  'The Ordinary',
  'Boots',
  'Cerave',
  'Bodyshop',
  'Superdrug',
  'Hair Care',
  'Shampoo',
  'Conditioner',
  'Hair Mask',
  'Hair oil',
  'Hair Serum',
  'Make up',
  'Lipstick',
  'Eye shadow',
  'Foundation',
  'Primer',
  'Eye items',
  'Body Care',
  'Medicine',
  'Baby Care',
  'Sun Protection',
  'Face Wash & Toner',
  'Jewellery',
  'Skincare',
  'Haircare',
  'Cosmetics',
  'Sunscreen',
  'Facewash',
  'Jewelry',
  'Cream',
  'Beauty & Care',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

const categoryAliases: Record<string, readonly string[]> = {
  Skincare: [
    'Skincare',
    'Skin Care (Face)',
    'Face Serum',
    "24 hour's Day Cream",
    'Day Cream',
    'Night Cream',
    'Face Mask',
    'Face Wash & Toner',
    'Facewash',
    'Cream',
  ],
  Haircare: ['Haircare', 'Hair Care', 'Shampoo', 'Conditioner', 'Hair Mask', 'Hair oil', 'Hair Serum'],
  Cosmetics: ['Cosmetics', 'Make up', 'Lipstick', 'Eye shadow', 'Foundation', 'Primer', 'Eye items'],
  'Body & Bath': ['Body & Bath', 'Body Care'],
  'Skin Care (Face)': [
    'Skin Care (Face)',
    'Skincare',
    'Face Serum',
    "24 hour's Day Cream",
    'Day Cream',
    'Night Cream',
    'Face Mask',
    'Face Wash & Toner',
    'Facewash',
    'Cream',
  ],
  'Hair Care': ['Hair Care', 'Haircare', 'Shampoo', 'Conditioner', 'Hair Mask', 'Hair oil', 'Hair Serum'],
  'Make up': ['Make up', 'Cosmetics', 'Lipstick', 'Eye shadow', 'Foundation', 'Primer', 'Eye items'],
  'Sun Protection': ['Sun Protection', 'Sunscreen'],
  'Face Wash & Toner': ['Face Wash & Toner', 'Facewash'],
  Jewellery: ['Jewellery', 'Jewelry'],
}

const normalize = (value: string) => value.trim().toLowerCase()

export function productMatchesCategory(
  product: { category: string; name: string; brand: string },
  selectedCategory: string,
): boolean {
  const terms = categoryAliases[selectedCategory] || [selectedCategory]
  const normalizedTerms = terms.map(normalize)
  const productCategory = normalize(product.category)

  if (normalizedTerms.includes(productCategory)) {
    return true
  }

  const searchableText = `${product.name} ${product.brand}`.toLowerCase()
  return normalizedTerms.some((term) => searchableText.includes(term))
}
