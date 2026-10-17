export type Money = number; // toman (WooCommerce currency IRT, 0 decimals)

export interface ProductImage { id: number; src: string; alt: string }
export interface AttributeTerm { id: number; name: string; slug: string }
export interface ProductAttribute { id: number; name: string; taxonomy: string; hasVariations: boolean; terms: AttributeTerm[] }
export interface VariationRef { id: number; attributes: { name: string; value: string }[] }

export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  sku: string;
  type: "simple" | "variable";
  price: Money;
  regularPrice: Money;
  salePrice: Money | null;
  priceMax: Money | null; // variable products with a price range
  inStock: boolean;
  lowStock: number | null;
  image: ProductImage | null;
  hoverImage: ProductImage | null;
  categories: { id: number; slug: string; name: string }[];
  colors: AttributeTerm[];
  shortDescription: string;
}

export interface Variation {
  id: number;
  attributes: Record<string, string>; // taxonomy -> term slug (e.g. pa_size -> size-48)
  price: Money;
  regularPrice: Money;
  salePrice: Money | null;
  inStock: boolean;
  lowStock: number | null;
  image: ProductImage | null;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: Variation[];
  material: string;
  fit: string;
  seoTitle: string;
  seoDescription: string;
  tags: { id: number; name: string }[];
  isSample: boolean;
}

export interface Category { id: number; slug: string; name: string; parent: number; count: number; description: string }

export interface CartItem {
  key: string;
  id: number; // product or variation id
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  maxQuantity: number;
  unitPrice: Money;
  regularUnitPrice: Money;
  lineTotal: Money;
  image: ProductImage | null;
  variation: { attribute: string; value: string }[];
}
export interface ShippingRate { rateId: string; name: string; cost: Money; selected: boolean }
export interface Cart {
  items: CartItem[];
  itemsCount: number;
  subtotal: Money;
  discount: Money;
  shipping: Money | null;
  total: Money;
  coupons: { code: string; discount: Money }[];
  shippingRates: ShippingRate[];
  packageId: number | string | null;
  needsShipping: boolean;
}

export interface ListParams {
  category?: string;
  search?: string;
  orderby?: "date" | "price" | "popularity" | "title";
  order?: "asc" | "desc";
  page?: number;
  perPage?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  sizes?: string[]; // term slugs
  colors?: string[]; // term slugs
  include?: number[];
  exclude?: number[];
  tag?: string;
}

export interface ListResult { products: ProductSummary[]; total: number; totalPages: number }
