import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  Ingredient,
  Transaction,
  StockMutation,
  CartItem,
  CartCustomization,
  ProductCategory,
  PaymentMethod,
  TransactionItem,
  NavTab,
  AdminUser,
  CashierAccount,
  ShopBranding,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INGREDIENTS,
  getSampleTransactions,
  INITIAL_MUTATIONS,
} from '../data/initialData';
import {
  subscribeBranding,
  saveBrandingToDb,
  subscribeCashierAccounts,
  saveCashierAccountToDb,
  deleteCashierAccountFromDb,
  subscribeProducts,
  saveProductToDb,
  deleteProductFromDb,
  subscribeIngredients,
  saveIngredientToDb,
  deleteIngredientFromDb,
  subscribeTransactions,
  saveTransactionWithUpdatesToDb,
  refundTransactionInDb,
  subscribeMutations,
  saveMutationToDb,
} from '../lib/firestoreSync';

interface CoffeeContextType {
  products: Product[];
  ingredients: Ingredient[];
  transactions: Transaction[];
  mutations: StockMutation[];
  cart: CartItem[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  loginAdmin: (username: string, password: string) => { success: boolean; error?: string };
  loginCashier: (username: string, pin: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  cashierAccounts: CashierAccount[];
  addCashierAccount: (data: { username: string; name: string; pin: string; isActive?: boolean }) => { success: boolean; error?: string };
  updateCashierAccount: (id: string, updates: Partial<{ username: string; name: string; pin: string; isActive: boolean }>) => { success: boolean; error?: string };
  deleteCashierAccount: (id: string) => { success: boolean; error?: string };
  toggleCashierStatus: (id: string) => void;
  cashierName: string;
  setCashierName: (name: string) => void;
  orderType: 'Dine In' | 'Take Away';
  setOrderType: (type: 'Dine In' | 'Take Away') => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  discountAmount: number;
  discountName: string;
  setDiscount: (amount: number, name: string) => void;
  includeTax: boolean;
  setIncludeTax: (val: boolean) => void;

  // Cart actions
  addToCart: (product: Product, customization?: CartCustomization) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Checkout & Transactions
  completeTransaction: (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ) => { success: boolean; transaction?: Transaction; error?: string };
  refundTransaction: (transactionId: string, reason: string) => boolean;
  selectedTransactionForReceipt: Transaction | null;
  setSelectedTransactionForReceipt: (t: Transaction | null) => void;

  // Inventory Management
  updateProductStock: (productId: string, quantityChange: number, type: 'IN' | 'OUT' | 'WASTE', notes: string) => void;
  updateIngredientStock: (ingredientId: string, quantityChange: number, type: 'IN' | 'OUT' | 'WASTE', notes: string) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;

  // Calculated totals
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemCount: number;

  // Real-time alerts
  lowStockItems: { id: string; name: string; current: number; min: number; unit: string; type: 'product' | 'ingredient' }[];
  resetToSampleData: () => void;

  // Shop Branding & Title Bar
  branding: ShopBranding;
  updateBranding: (updates: Partial<ShopBranding>) => void;
  resetBranding: () => void;

  // Cloud Database Connection State
  isFirebaseConnected: boolean;
  dbSyncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
}

const CoffeeContext = createContext<CoffeeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'efek_kafein_products_v1',
  INGREDIENTS: 'efek_kafein_ingredients_v1',
  TRANSACTIONS: 'efek_kafein_transactions_v1',
  MUTATIONS: 'efek_kafein_mutations_v1',
  ADMIN_SESSION: 'efek_kafein_admin_session_v1',
  CASHIER_ACCOUNTS: 'efek_kafein_cashier_accounts_v1',
  BRANDING: 'efek_kafein_branding_v1',
};

export const DEFAULT_BRANDING: ShopBranding = {
  storeName: 'Efek Kafein',
  tagline: 'Sistem Penjualan & Inventaris Real-time',
  titleBarText: 'Kedai Kopi Efek Kafein',
  logoType: 'preset',
  presetIcon: 'Coffee',
  customLogoUrl: '',
  address: 'Jl. Kafein Boulevard No. 18, Jakarta',
  instagram: '@efekkafein.id',
};

const INITIAL_CASHIER_ACCOUNTS: CashierAccount[] = [
  {
    id: 'csh-1',
    username: 'arya',
    name: 'Barista Arya',
    pin: '1234',
    isActive: true,
    createdAt: '2026-03-01T08:00:00.000Z',
    lastLogin: '2026-03-18T07:30:00.000Z',
  },
  {
    id: 'csh-2',
    username: 'maya',
    name: 'Barista Maya',
    pin: '1234',
    isActive: true,
    createdAt: '2026-03-05T08:00:00.000Z',
    lastLogin: '2026-03-17T14:15:00.000Z',
  },
  {
    id: 'csh-3',
    username: 'budi',
    name: 'Barista Budi',
    pin: '1234',
    isActive: true,
    createdAt: '2026-03-10T08:00:00.000Z',
    lastLogin: '2026-03-16T09:00:00.000Z',
  },
];

export const CoffeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : getSampleTransactions();
  });

  const [mutations, setMutations] = useState<StockMutation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_MUTATIONS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [cashierName, setCashierName] = useState('Barista Arya');

  // Cashier Accounts state (managed by Admin)
  const [cashierAccounts, setCashierAccounts] = useState<CashierAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASHIER_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_CASHIER_ACCOUNTS;
    } catch {
      return INITIAL_CASHIER_ACCOUNTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CASHIER_ACCOUNTS, JSON.stringify(cashierAccounts));
    } catch (err) {
      console.error('Failed to save cashier accounts', err);
    }
  }, [cashierAccounts]);

  // System Branding & Title Bar state (managed by Admin)
  const [branding, setBranding] = useState<ShopBranding>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
      return saved ? { ...DEFAULT_BRANDING, ...JSON.parse(saved) } : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [dbSyncStatus, setDbSyncStatus] = useState<'connected' | 'syncing' | 'offline' | 'error'>('connected');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
    } catch (err) {
      console.error('Failed to save branding', err);
    }
  }, [branding]);

  // Synchronize browser tab document.title with titleBarText
  useEffect(() => {
    if (branding.titleBarText) {
      document.title = branding.titleBarText;
    }
  }, [branding.titleBarText]);

  // ==========================================
  // REAL-TIME FIRESTORE DATABASE SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    try {
      setDbSyncStatus('syncing');

      // 1. Branding (Logo, Title Bar, Store Info)
      const unsubBranding = subscribeBranding((remoteBranding) => {
        setBranding(remoteBranding);
        setLastSyncedAt(new Date());
      }, DEFAULT_BRANDING);
      unsubscribers.push(unsubBranding);

      // 2. Cashier Accounts
      const unsubCashiers = subscribeCashierAccounts((remoteAccounts) => {
        setCashierAccounts(remoteAccounts);
        setLastSyncedAt(new Date());
      }, INITIAL_CASHIER_ACCOUNTS);
      unsubscribers.push(unsubCashiers);

      // 3. Products
      const unsubProducts = subscribeProducts((remoteProducts) => {
        setProducts(remoteProducts);
        setLastSyncedAt(new Date());
      }, INITIAL_PRODUCTS);
      unsubscribers.push(unsubProducts);

      // 4. Ingredients
      const unsubIngredients = subscribeIngredients((remoteIngredients) => {
        setIngredients(remoteIngredients);
        setLastSyncedAt(new Date());
      }, INITIAL_INGREDIENTS);
      unsubscribers.push(unsubIngredients);

      // 5. Transactions
      const unsubTransactions = subscribeTransactions((remoteTransactions) => {
        setTransactions(remoteTransactions);
        setLastSyncedAt(new Date());
      }, getSampleTransactions());
      unsubscribers.push(unsubTransactions);

      // 6. Stock Mutations
      const unsubMutations = subscribeMutations((remoteMutations) => {
        setMutations(remoteMutations);
        setLastSyncedAt(new Date());
      }, INITIAL_MUTATIONS);
      unsubscribers.push(unsubMutations);

      setIsFirebaseConnected(true);
      setDbSyncStatus('connected');
    } catch (err) {
      console.error('Error attaching Firestore real-time listeners:', err);
      setIsFirebaseConnected(false);
      setDbSyncStatus('error');
    }

    return () => {
      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
    };
  }, []);

  const updateBranding = (updates: Partial<ShopBranding>) => {
    const updated = { ...branding, ...updates };
    setBranding(updated);
    saveBrandingToDb(updated).catch((err) => {
      console.error('Failed to sync branding to cloud database:', err);
    });
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
    saveBrandingToDb(DEFAULT_BRANDING).catch((err) => {
      console.error('Failed to reset branding in cloud database:', err);
    });
  };

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = !!adminUser;
  const isAdminLoggedIn = !!adminUser && adminUser.role !== 'Kasir / Barista';

  const loginAdmin = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Silakan isi username dan kata sandi admin.' };
    }

    const validAdminUsers = ['admin', 'manager', 'manajer', 'owner', 'supervisor', 'admin@efekkafein.com'];
    const validPass = ['admin', 'admin123', 'kafein2026', '123456'];

    if (validAdminUsers.includes(cleanUser) && validPass.includes(cleanPass)) {
      const isOwner = cleanUser.includes('owner');
      const isSupervisor = cleanUser.includes('supervisor');
      const userObj: AdminUser = {
        username: cleanUser,
        name: isOwner ? 'Owner Hendra' : isSupervisor ? 'Supervisor Denny' : 'Manager Arya Kafein',
        role: isSupervisor ? 'Supervisor' : 'Owner / Manajer',
        loginTime: new Date().toISOString(),
      };
      setAdminUser(userObj);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(userObj));
      } catch (err) {
        console.error('Failed to save admin session', err);
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Username atau kata sandi Admin tidak valid. Periksa kembali kredensial Anda.',
    };
  };

  const loginCashier = (username: string, pin: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanUser || !cleanPin) {
      return { success: false, error: 'Silakan isi username dan PIN/kata sandi kasir.' };
    }

    const account = cashierAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanUser
    );

    if (!account) {
      return {
        success: false,
        error: 'Akun kasir tidak ditemukan. Hubungi Admin / Manajer untuk mendaftarkan akun kasir Anda.',
      };
    }

    if (!account.isActive) {
      return {
        success: false,
        error: `Akses login untuk "${account.name}" telah dinonaktifkan oleh Admin di pengaturan dashboard. Hubungi Manajer untuk mengaktifkannya kembali.`,
      };
    }

    if (account.pin !== cleanPin) {
      return {
        success: false,
        error: 'PIN atau kata sandi kasir salah. Silakan coba kembali.',
      };
    }

    // Success login
    const nowIso = new Date().toISOString();
    setCashierAccounts((prev) =>
      prev.map((acc) => (acc.id === account.id ? { ...acc, lastLogin: nowIso } : acc))
    );

    setCashierName(account.name);

    const userObj: AdminUser = {
      username: account.username,
      name: account.name,
      role: 'Kasir / Barista',
      loginTime: nowIso,
    };

    setAdminUser(userObj);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(userObj));
    } catch (err) {
      console.error('Failed to save cashier session', err);
    }

    setActiveTab('pos');
    return { success: true };
  };

  // Cashier Account Management by Admin
  const addCashierAccount = (data: {
    username: string;
    name: string;
    pin: string;
    isActive?: boolean;
  }): { success: boolean; error?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanPin = data.pin.trim();

    if (!cleanUsername || !cleanName || !cleanPin) {
      return { success: false, error: 'Nama kasir, username, dan PIN wajib diisi.' };
    }

    if (cleanUsername === 'admin' || cleanUsername === 'owner') {
      return { success: false, error: 'Username ini dicadangkan untuk Admin.' };
    }

    if (cashierAccounts.some((acc) => acc.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Username "${cleanUsername}" sudah digunakan oleh kasir lain.` };
    }

    const newAccount: CashierAccount = {
      id: `csh-${Date.now()}`,
      username: cleanUsername,
      name: cleanName,
      pin: cleanPin,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
    };

    setCashierAccounts((prev) => [newAccount, ...prev]);
    saveCashierAccountToDb(newAccount).catch((err) => console.error('Failed to sync new cashier to db:', err));
    return { success: true };
  };

  const updateCashierAccount = (
    id: string,
    updates: Partial<{ username: string; name: string; pin: string; isActive: boolean }>
  ): { success: boolean; error?: string } => {
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      if (cleanUsername === 'admin' || cleanUsername === 'owner') {
        return { success: false, error: 'Username ini dicadangkan untuk Admin.' };
      }
      if (
        cashierAccounts.some(
          (acc) => acc.id !== id && acc.username.toLowerCase() === cleanUsername
        )
      ) {
        return { success: false, error: `Username "${cleanUsername}" sudah digunakan.` };
      }
    }

    let updatedAcc: CashierAccount | null = null;
    setCashierAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          updatedAcc = {
            ...acc,
            ...(updates.username ? { username: updates.username.trim().toLowerCase() } : {}),
            ...(updates.name ? { name: updates.name.trim() } : {}),
            ...(updates.pin ? { pin: updates.pin.trim() } : {}),
            ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
          };
          return updatedAcc;
        }
        return acc;
      })
    );

    if (updatedAcc) {
      saveCashierAccountToDb(updatedAcc).catch((err) => console.error('Failed to sync updated cashier to db:', err));
    }

    return { success: true };
  };

  const deleteCashierAccount = (id: string): { success: boolean; error?: string } => {
    if (cashierAccounts.length <= 1) {
      return { success: false, error: 'Minimal harus ada 1 akun kasir terdaftar dalam sistem.' };
    }
    setCashierAccounts((prev) => prev.filter((acc) => acc.id !== id));
    deleteCashierAccountFromDb(id).catch((err) => console.error('Failed to delete cashier from db:', err));
    return { success: true };
  };

  const toggleCashierStatus = (id: string) => {
    let toggled: CashierAccount | null = null;
    setCashierAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          toggled = { ...acc, isActive: !acc.isActive };
          return toggled;
        }
        return acc;
      })
    );
    if (toggled) {
      saveCashierAccountToDb(toggled).catch((err) => console.error('Failed to toggle cashier in db:', err));
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch (err) {
      console.error('Failed to remove admin session', err);
    }
    setActiveTab('pos');
  };
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away'>('Dine In');
  const [tableNumber, setTableNumber] = useState('Meja 01');
  const [customerName, setCustomerName] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountName, setDiscountName] = useState('');
  const [includeTax, setIncludeTax] = useState(true);
  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(mutations));
  }, [mutations]);

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartTax = includeTax ? Math.round(Math.max(0, cartSubtotal - discountAmount) * 0.1) : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount) + cartTax;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const setDiscount = (amount: number, name: string) => {
    setDiscountAmount(amount);
    setDiscountName(name);
  };

  const addToCart = (product: Product, customization?: CartCustomization) => {
    const extraPrice = (customization?.milkOption?.includes('Oatmilk') ? 6000 : 0) + (customization?.extraShot ? 5000 : 0);
    const unitPrice = product.price + extraPrice;

    // create unique signature for matching options
    const customKey = `${product.id}-${customization?.temperature || 'Def'}-${customization?.sugarLevel || '100'}-${customization?.milkOption || 'Reg'}-${customization?.extraShot ? 'Extra' : 'No'}-${customization?.notes || ''}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === customKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: updated[existingIndex].itemPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: customKey,
          product,
          quantity: 1,
          customization: customization || {},
          itemPrice: unitPrice,
          totalPrice: unitPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.itemPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setDiscountName('');
    setCustomerName('');
  };

  // Complete Transaction
  const completeTransaction = (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ): { success: boolean; transaction?: Transaction; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Keranjang belanja kosong' };
    }

    if (amountPaid < cartTotal) {
      return { success: false, error: 'Nominal pembayaran kurang dari total tagihan' };
    }

    const now = new Date();
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (transactions.length + 1).toString().padStart(3, '0');
    const transactionId = `EFEK-${dateFormatted}-${seq}`;

    // Compute COGS
    let totalCogs = 0;
    const transactionItems: TransactionItem[] = cart.map((item) => {
      totalCogs += item.product.cogs * item.quantity;
      return {
        productId: item.product.id,
        productName: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        price: item.itemPrice,
        cogs: item.product.cogs,
        totalPrice: item.totalPrice,
        customization: item.customization,
      };
    });

    const newTransaction: Transaction = {
      id: transactionId,
      timestamp: now.toISOString(),
      cashierName: cashierName || 'Kasir',
      customerName: customerName.trim() || 'Tamu',
      orderType,
      tableNumber: orderType === 'Dine In' ? tableNumber : undefined,
      items: transactionItems,
      subtotal: cartSubtotal,
      discount: discountAmount,
      discountName: discountName || undefined,
      tax: cartTax,
      totalAmount: cartTotal,
      totalCogs,
      paymentMethod,
      amountPaid,
      change: Math.max(0, amountPaid - cartTotal),
      status: 'COMPLETED',
    };

    // Deduct stock for products and ingredients
    const newMutations: StockMutation[] = [];
    let nextProductsList: Product[] = [];
    let nextIngredientsList: Ingredient[] = [];

    // Deduct product stock
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      cart.forEach((cartItem) => {
        const prodIndex = updated.findIndex((p) => p.id === cartItem.product.id);
        if (prodIndex > -1) {
          const currentStock = updated[prodIndex].stock;
          const nextStock = Math.max(0, currentStock - cartItem.quantity);
          updated[prodIndex] = { ...updated[prodIndex], stock: nextStock };

          newMutations.push({
            id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: now.toISOString(),
            itemId: cartItem.product.id,
            itemName: cartItem.product.name,
            type: 'SALE',
            quantity: cartItem.quantity,
            unit: 'cup/item',
            notes: `Terjual pada transaksi ${transactionId}`,
            referenceId: transactionId,
          });
        }
      });
      nextProductsList = updated;
      return updated;
    });

    // Deduct raw ingredients
    setIngredients((prevIngredients) => {
      const updatedIngs = [...prevIngredients];
      cart.forEach((cartItem) => {
        if (cartItem.product.recipe && cartItem.product.recipe.length > 0) {
          cartItem.product.recipe.forEach((rec) => {
            const ingIdx = updatedIngs.findIndex((i) => i.id === rec.ingredientId);
            if (ingIdx > -1) {
              const totalRequired = rec.amountRequired * cartItem.quantity;
              const nextStock = Math.max(0, updatedIngs[ingIdx].stock - totalRequired);
              updatedIngs[ingIdx] = { ...updatedIngs[ingIdx], stock: nextStock };

              newMutations.push({
                id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                timestamp: now.toISOString(),
                itemId: updatedIngs[ingIdx].id,
                itemName: updatedIngs[ingIdx].name,
                type: 'SALE',
                quantity: totalRequired,
                unit: updatedIngs[ingIdx].unit,
                notes: `Bahan baku untuk ${cartItem.quantity}x ${cartItem.product.name} (${transactionId})`,
                referenceId: transactionId,
              });
            }
          });
        }
      });
      nextIngredientsList = updatedIngs;
      return updatedIngs;
    });

    setMutations((prev) => [...newMutations, ...prev]);
    setTransactions((prev) => [newTransaction, ...prev]);
    setSelectedTransactionForReceipt(newTransaction);

    // Save transaction and atomic stock changes to Firestore Cloud Database
    saveTransactionWithUpdatesToDb(
      newTransaction,
      nextProductsList,
      nextIngredientsList,
      newMutations
    ).catch((err) => console.error('Failed to sync transaction to cloud database:', err));

    // Confetti effect on successful order
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#d97706', '#b45309', '#f59e0b', '#241b16'],
      });
    } catch {
      // ignore
    }

    clearCart();
    return { success: true, transaction: newTransaction };
  };

  // Refund Transaction
  const refundTransaction = (transactionId: string, reason: string): boolean => {
    const target = transactions.find((t) => t.id === transactionId);
    if (!target || target.status === 'REFUNDED') return false;

    const now = new Date();
    const refundMutations: StockMutation[] = [];
    let restoredProducts: Product[] = [];

    // Restore products stock
    setProducts((prev) => {
      const updated = [...prev];
      target.items.forEach((item) => {
        const idx = updated.findIndex((p) => p.id === item.productId);
        if (idx > -1) {
          updated[idx] = { ...updated[idx], stock: updated[idx].stock + item.quantity };
          refundMutations.push({
            id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: now.toISOString(),
            itemId: item.productId,
            itemName: item.productName,
            type: 'REFUND',
            quantity: item.quantity,
            unit: 'cup/item',
            notes: `Refund ${transactionId}: ${reason}`,
            referenceId: transactionId,
          });
        }
      });
      restoredProducts = updated;
      return updated;
    });

    // Mark as refunded
    const updatedTx: Transaction = {
      ...target,
      status: 'REFUNDED',
      refundReason: reason,
    };

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? updatedTx : t))
    );

    setMutations((prev) => [...refundMutations, ...prev]);

    refundTransactionInDb(updatedTx, restoredProducts, refundMutations).catch((err) =>
      console.error('Failed to sync refund to cloud database:', err)
    );

    return true;
  };

  // Inventory modifications
  const updateProductStock = (
    productId: string,
    quantityChange: number,
    type: 'IN' | 'OUT' | 'WASTE',
    notes: string
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    let updatedProd: Product | null = null;
    const newStock = Math.max(0, target.stock + (type === 'IN' ? quantityChange : -quantityChange));
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProd = { ...p, stock: newStock };
          return updatedProd;
        }
        return p;
      })
    );

    const mutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemId: productId,
      itemName: target.name,
      type,
      quantity: quantityChange,
      unit: 'cup/item',
      notes,
    };
    setMutations((prev) => [mutation, ...prev]);

    if (updatedProd) {
      saveProductToDb(updatedProd).catch((err) => console.error('Failed to sync product stock to db:', err));
    }
    saveMutationToDb(mutation).catch((err) => console.error('Failed to sync mutation to db:', err));
  };

  const updateIngredientStock = (
    ingredientId: string,
    quantityChange: number,
    type: 'IN' | 'OUT' | 'WASTE',
    notes: string
  ) => {
    const target = ingredients.find((i) => i.id === ingredientId);
    if (!target) return;

    let updatedIng: Ingredient | null = null;
    const newStock = Math.max(0, target.stock + (type === 'IN' ? quantityChange : -quantityChange));
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id === ingredientId) {
          updatedIng = { ...i, stock: newStock };
          return updatedIng;
        }
        return i;
      })
    );

    const mutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemId: ingredientId,
      itemName: target.name,
      type,
      quantity: quantityChange,
      unit: target.unit,
      notes,
    };
    setMutations((prev) => [mutation, ...prev]);

    if (updatedIng) {
      saveIngredientToDb(updatedIng).catch((err) => console.error('Failed to sync ingredient stock to db:', err));
    }
    saveMutationToDb(mutation).catch((err) => console.error('Failed to sync mutation to db:', err));
  };

  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [...prev, product];
    });
    saveProductToDb(product).catch((err) => console.error('Failed to sync product to db:', err));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromDb(productId).catch((err) => console.error('Failed to delete product from db:', err));
  };

  const saveIngredient = (ingredient: Ingredient) => {
    setIngredients((prev) => {
      const idx = prev.findIndex((i) => i.id === ingredient.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = ingredient;
        return updated;
      }
      return [...prev, ingredient];
    });
    saveIngredientToDb(ingredient).catch((err) => console.error('Failed to sync ingredient to db:', err));
  };

  const deleteIngredient = (ingredientId: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
    deleteIngredientFromDb(ingredientId).catch((err) => console.error('Failed to delete ingredient from db:', err));
  };

  const resetToSampleData = () => {
    if (window.confirm('Reset data kasir, produk, dan transaksi ke data awal default?')) {
      setProducts(INITIAL_PRODUCTS);
      setIngredients(INITIAL_INGREDIENTS);
      setTransactions(getSampleTransactions());
      setMutations(INITIAL_MUTATIONS);
      setCashierAccounts(INITIAL_CASHIER_ACCOUNTS);
      clearCart();
    }
  };

  // Check low stock
  const lowStockItems: {
    id: string;
    name: string;
    current: number;
    min: number;
    unit: string;
    type: 'product' | 'ingredient';
  }[] = [];

  products.forEach((p) => {
    if (p.stock <= p.minStock) {
      lowStockItems.push({
        id: p.id,
        name: p.name,
        current: p.stock,
        min: p.minStock,
        unit: 'porsi/pcs',
        type: 'product',
      });
    }
  });

  ingredients.forEach((ing) => {
    if (ing.stock <= ing.minStock) {
      lowStockItems.push({
        id: ing.id,
        name: ing.name,
        current: ing.stock,
        min: ing.minStock,
        unit: ing.unit,
        type: 'ingredient',
      });
    }
  });

  return (
    <CoffeeContext.Provider
      value={{
        products,
        ingredients,
        transactions,
        mutations,
        cart,
        activeTab,
        setActiveTab,
        isLoggedIn,
        isAdminLoggedIn,
        adminUser,
        loginAdmin,
        loginCashier,
        logoutAdmin,
        cashierAccounts,
        addCashierAccount,
        updateCashierAccount,
        deleteCashierAccount,
        toggleCashierStatus,
        cashierName,
        setCashierName,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        discountAmount,
        discountName,
        setDiscount,
        includeTax,
        setIncludeTax,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        completeTransaction,
        refundTransaction,
        selectedTransactionForReceipt,
        setSelectedTransactionForReceipt,
        updateProductStock,
        updateIngredientStock,
        saveProduct,
        deleteProduct,
        saveIngredient,
        deleteIngredient,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartItemCount,
        lowStockItems,
        resetToSampleData,
        branding,
        updateBranding,
        resetBranding,
        isFirebaseConnected,
        dbSyncStatus,
        lastSyncedAt,
      }}
    >
      {children}
    </CoffeeContext.Provider>
  );
};

export const useCoffee = () => {
  const context = useContext(CoffeeContext);
  if (!context) {
    throw new Error('useCoffee must be used within a CoffeeProvider');
  }
  return context;
};
