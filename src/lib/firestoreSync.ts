import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { getDb } from './firebase';
import {
  ShopBranding,
  Product,
  Ingredient,
  Transaction,
  CashierAccount,
  StockMutation,
} from '../types';

// ==========================================
// BRANDING SYNC
// ==========================================
export const subscribeBranding = (
  onData: (branding: ShopBranding) => void,
  defaultBranding: ShopBranding
) => {
  try {
    const db = getDb();
    const brandingRef = doc(db, 'branding', 'settings');

    return onSnapshot(
      brandingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<ShopBranding>;
          onData({
            ...defaultBranding,
            ...data,
          });
        } else {
          // Initialize document in Firestore if not yet present
          setDoc(brandingRef, {
            ...defaultBranding,
            updatedAt: new Date().toISOString(),
          }).catch((err) => console.error('Error seeding branding to Firestore:', err));
        }
      },
      (error) => {
        console.error('Firestore branding listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to branding:', err);
    return () => {};
  }
};

export const saveBrandingToDb = async (branding: ShopBranding): Promise<void> => {
  try {
    const db = getDb();
    const brandingRef = doc(db, 'branding', 'settings');
    await setDoc(
      brandingRef,
      {
        ...branding,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save branding to Firestore:', err);
    throw err;
  }
};

// ==========================================
// CASHIER ACCOUNTS SYNC
// ==========================================
export const subscribeCashierAccounts = (
  onData: (accounts: CashierAccount[]) => void,
  initialAccounts: CashierAccount[]
) => {
  try {
    const db = getDb();
    const colRef = collection(db, 'cashierAccounts');

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const accounts: CashierAccount[] = [];
          snapshot.forEach((d) => {
            accounts.push(d.data() as CashierAccount);
          });
          onData(accounts);
        } else {
          // Seed initial cashier accounts if Firestore collection is completely empty
          const batch = writeBatch(db);
          initialAccounts.forEach((acc) => {
            const ref = doc(db, 'cashierAccounts', acc.id);
            batch.set(ref, acc);
          });
          batch.commit().catch((err) => console.error('Failed to seed cashier accounts:', err));
        }
      },
      (error) => {
        console.error('Firestore cashier accounts listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe cashier accounts:', err);
    return () => {};
  }
};

export const saveCashierAccountToDb = async (account: CashierAccount): Promise<void> => {
  try {
    const db = getDb();
    await setDoc(doc(db, 'cashierAccounts', account.id), account);
  } catch (err) {
    console.error('Failed to save cashier account to Firestore:', err);
  }
};

export const deleteCashierAccountFromDb = async (accountId: string): Promise<void> => {
  try {
    const db = getDb();
    await deleteDoc(doc(db, 'cashierAccounts', accountId));
  } catch (err) {
    console.error('Failed to delete cashier account from Firestore:', err);
  }
};

// ==========================================
// PRODUCTS SYNC
// ==========================================
export const subscribeProducts = (
  onData: (products: Product[]) => void,
  initialProducts: Product[]
) => {
  try {
    const db = getDb();
    const colRef = collection(db, 'products');

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Product[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as Product);
          });
          // Sort items by name
          items.sort((a, b) => a.name.localeCompare(b.name));
          onData(items);
        } else {
          // Seed initial products
          const batch = writeBatch(db);
          initialProducts.forEach((p) => {
            const ref = doc(db, 'products', p.id);
            batch.set(ref, p);
          });
          batch.commit().catch((err) => console.error('Failed to seed products:', err));
        }
      },
      (error) => {
        console.error('Firestore products listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe products:', err);
    return () => {};
  }
};

export const saveProductToDb = async (product: Product): Promise<void> => {
  try {
    const db = getDb();
    await setDoc(doc(db, 'products', product.id), product);
  } catch (err) {
    console.error('Failed to save product to Firestore:', err);
  }
};

export const deleteProductFromDb = async (productId: string): Promise<void> => {
  try {
    const db = getDb();
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.error('Failed to delete product from Firestore:', err);
  }
};

// ==========================================
// INGREDIENTS SYNC
// ==========================================
export const subscribeIngredients = (
  onData: (ingredients: Ingredient[]) => void,
  initialIngredients: Ingredient[]
) => {
  try {
    const db = getDb();
    const colRef = collection(db, 'ingredients');

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Ingredient[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as Ingredient);
          });
          items.sort((a, b) => a.name.localeCompare(b.name));
          onData(items);
        } else {
          const batch = writeBatch(db);
          initialIngredients.forEach((ing) => {
            const ref = doc(db, 'ingredients', ing.id);
            batch.set(ref, ing);
          });
          batch.commit().catch((err) => console.error('Failed to seed ingredients:', err));
        }
      },
      (error) => {
        console.error('Firestore ingredients listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe ingredients:', err);
    return () => {};
  }
};

export const saveIngredientToDb = async (ingredient: Ingredient): Promise<void> => {
  try {
    const db = getDb();
    await setDoc(doc(db, 'ingredients', ingredient.id), ingredient);
  } catch (err) {
    console.error('Failed to save ingredient to Firestore:', err);
  }
};

export const deleteIngredientFromDb = async (ingredientId: string): Promise<void> => {
  try {
    const db = getDb();
    await deleteDoc(doc(db, 'ingredients', ingredientId));
  } catch (err) {
    console.error('Failed to delete ingredient from Firestore:', err);
  }
};

// ==========================================
// TRANSACTIONS SYNC
// ==========================================
export const subscribeTransactions = (
  onData: (transactions: Transaction[]) => void,
  initialTransactions: Transaction[]
) => {
  try {
    const db = getDb();
    const colRef = collection(db, 'transactions');

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const txs: Transaction[] = [];
          snapshot.forEach((d) => {
            txs.push(d.data() as Transaction);
          });
          // Sort newest first
          txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          onData(txs);
        } else {
          const batch = writeBatch(db);
          initialTransactions.forEach((tx) => {
            const ref = doc(db, 'transactions', tx.id);
            batch.set(ref, tx);
          });
          batch.commit().catch((err) => console.error('Failed to seed transactions:', err));
        }
      },
      (error) => {
        console.error('Firestore transactions listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe transactions:', err);
    return () => {};
  }
};

export const saveTransactionWithUpdatesToDb = async (
  transaction: Transaction,
  updatedProducts: Product[],
  updatedIngredients: Ingredient[],
  newMutations: StockMutation[]
): Promise<void> => {
  try {
    const db = getDb();
    const batch = writeBatch(db);

    // 1. Transaction doc
    batch.set(doc(db, 'transactions', transaction.id), transaction);

    // 2. Updated products
    updatedProducts.forEach((p) => {
      batch.set(doc(db, 'products', p.id), p);
    });

    // 3. Updated ingredients
    updatedIngredients.forEach((ing) => {
      batch.set(doc(db, 'ingredients', ing.id), ing);
    });

    // 4. New stock mutations
    newMutations.forEach((mut) => {
      batch.set(doc(db, 'inventoryMutations', mut.id), mut);
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed to save transaction to Firestore:', err);
  }
};

export const refundTransactionInDb = async (
  transaction: Transaction,
  updatedProducts: Product[],
  refundMutations: StockMutation[]
): Promise<void> => {
  try {
    const db = getDb();
    const batch = writeBatch(db);

    batch.set(doc(db, 'transactions', transaction.id), transaction);

    updatedProducts.forEach((p) => {
      batch.set(doc(db, 'products', p.id), p);
    });

    refundMutations.forEach((mut) => {
      batch.set(doc(db, 'inventoryMutations', mut.id), mut);
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed to refund transaction in Firestore:', err);
  }
};

// ==========================================
// MUTATIONS SYNC
// ==========================================
export const subscribeMutations = (
  onData: (mutations: StockMutation[]) => void,
  initialMutations: StockMutation[]
) => {
  try {
    const db = getDb();
    const colRef = collection(db, 'inventoryMutations');

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const muts: StockMutation[] = [];
          snapshot.forEach((d) => {
            muts.push(d.data() as StockMutation);
          });
          muts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          onData(muts);
        } else {
          const batch = writeBatch(db);
          initialMutations.forEach((m) => {
            const ref = doc(db, 'inventoryMutations', m.id);
            batch.set(ref, m);
          });
          batch.commit().catch((err) => console.error('Failed to seed mutations:', err));
        }
      },
      (error) => {
        console.error('Firestore mutations listener error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe mutations:', err);
    return () => {};
  }
};

export const saveMutationToDb = async (mutation: StockMutation): Promise<void> => {
  try {
    const db = getDb();
    await setDoc(doc(db, 'inventoryMutations', mutation.id), mutation);
  } catch (err) {
    console.error('Failed to save mutation to Firestore:', err);
  }
};
