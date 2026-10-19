export type ProductCategory = 'coffee' | 'signature' | 'non-coffee' | 'food' | 'beans';

export interface RecipeItem {
  ingredientId: string;
  amountRequired: number; // e.g., 18 (grams), 150 (ml), 1 (pcs)
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  cogs: number; // Cost of Goods Sold / HPP
  stock: number; // Current finished stock or daily prep stock
  minStock: number; // Warning threshold
  image: string;
  description: string;
  isPopular?: boolean;
  recipe?: RecipeItem[]; // Ingredients deducted on sale
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'gram' | 'ml' | 'pcs' | 'kg' | 'liter';
  stock: number;
  minStock: number;
  costPerUnit: number;
  category: 'beans' | 'dairy' | 'syrup' | 'powder' | 'packaging';
}

export interface CartCustomization {
  temperature?: 'Hot' | 'Iced';
  sugarLevel?: '100%' | '70%' | '50%' | '0%';
  extraShot?: boolean;
  milkOption?: 'Reguler' | 'Oatmilk (+Rp6k)';
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customization: CartCustomization;
  itemPrice: number; // unit price + add-ons
  totalPrice: number;
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export interface TransactionItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  price: number;
  cogs: number;
  totalPrice: number;
  customization?: CartCustomization;
}

export interface Transaction {
  id: string; // e.g. EFEK-20260918-001
  timestamp: string; // ISO string
  cashierName: string;
  customerName: string;
  orderType: 'Dine In' | 'Take Away';
  tableNumber?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  discountName?: string;
  tax: number; // PB1 10%
  totalAmount: number;
  totalCogs: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: 'COMPLETED' | 'REFUNDED';
  refundReason?: string;
}

export interface StockMutation {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'SALE' | 'WASTE' | 'REFUND';
  quantity: number;
  unit: string;
  notes: string;
  referenceId?: string; // e.g. Transaction ID
}

export type NavTab = 'pos' | 'inventory' | 'reports' | 'admin-login';

export interface AdminUser {
  username: string;
  name: string;
  role: 'Owner / Manajer' | 'Supervisor' | 'Kasir / Barista';
  loginTime: string;
}

export interface CashierAccount {
  id: string;
  username: string;
  name: string;
  pin: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  totalItemsSold: number;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  hourlySales: { hour: string; revenue: number; orders: number }[];
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
}

export type PresetIconName = 'Coffee' | 'Flame' | 'CupSoda' | 'Sparkles' | 'Store' | 'Heart' | 'Zap';

export interface ShopBranding {
  storeName: string;
  tagline: string;
  titleBarText: string;
  logoType: 'preset' | 'custom';
  presetIcon: PresetIconName;
  customLogoUrl: string;
  address: string;
  instagram: string;
}
