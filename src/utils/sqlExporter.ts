import {
  Product,
  Ingredient,
  Transaction,
  StockMutation,
  CashierAccount,
  ShopBranding,
} from '../types';

/**
 * Escape MySQL string literals
 */
function escapeSqlString(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  })}'`;
}

/**
 * Format MySQL DATETIME string
 */
function formatSqlDateTime(isoString?: string): string {
  if (!isoString) {
    const now = new Date();
    return `'${now.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    return `'${d.toISOString().slice(0, 19).replace('T', ' ')}'`;
  } catch {
    return `'${new Date().toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
}

export interface LiveExportData {
  products: Product[];
  ingredients: Ingredient[];
  transactions: Transaction[];
  mutations: StockMutation[];
  cashierAccounts: CashierAccount[];
  branding: ShopBranding;
}

/**
 * Generates a full MySQL dump string containing DDL and current data
 */
export function generateMySqlDump(data: LiveExportData): string {
  const exportTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let sql = `-- =====================================================================
-- DATABASE MYSQL DUMP: KEDAI KOPI EFEK KAFEIN
-- Tanggal Ekspor : ${exportTimestamp}
-- Target Engine  : MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- Format         : UTF-8 Unicode SQL Dump
-- Kompatibel     : phpMyAdmin, MySQL Workbench, DBeaver, Navicat, Terminal CLI
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- -------------------------------------------------------------
-- 1. PEMBUATAN DATABASE
-- -------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS \`kedai_kopi_efek_kafein\`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`kedai_kopi_efek_kafein\`;

-- -------------------------------------------------------------
-- 2. TABEL: shop_branding
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`shop_branding\`;
CREATE TABLE \`shop_branding\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`store_name\` VARCHAR(150) NOT NULL DEFAULT 'Efek Kafein',
  \`tagline\` VARCHAR(255) DEFAULT 'Sistem Penjualan & Inventaris Real-time',
  \`title_bar_text\` VARCHAR(255) DEFAULT 'Kedai Kopi Efek Kafein',
  \`logo_type\` ENUM('preset', 'custom') NOT NULL DEFAULT 'preset',
  \`preset_icon\` VARCHAR(50) NOT NULL DEFAULT 'Coffee',
  \`custom_logo_url\` TEXT NULL,
  \`address\` VARCHAR(255) DEFAULT 'Jl. Kafein Boulevard No. 18, Jakarta',
  \`instagram\` VARCHAR(100) DEFAULT '@efekkafein.id',
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pengaturan branding kedai kopi';

-- -------------------------------------------------------------
-- 3. TABEL: categories
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`code\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` VARCHAR(255) NULL,
  PRIMARY KEY (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kategori produk kedai';

-- -------------------------------------------------------------
-- 4. TABEL: admin_users
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`admin_users\`;
CREATE TABLE \`admin_users\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Owner / Manajer',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_admin_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun login admin dan manajer';

-- -------------------------------------------------------------
-- 5. TABEL: cashier_accounts
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`cashier_accounts\`;
CREATE TABLE \`cashier_accounts\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`pin\` VARCHAR(20) NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`last_login\` DATETIME NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_cashier_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun kasir dan barista POS';

-- -------------------------------------------------------------
-- 6. TABEL: ingredients
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`ingredients\`;
CREATE TABLE \`ingredients\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`category\` ENUM('beans', 'dairy', 'syrup', 'powder', 'packaging') NOT NULL,
  \`unit\` ENUM('gram', 'ml', 'pcs', 'kg', 'liter') NOT NULL,
  \`stock\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`min_stock\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`cost_per_unit\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Harga beli per unit (Rp)',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_ingredients_category\` (\`category\`),
  KEY \`idx_ingredients_stock\` (\`stock\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stok bahan baku & packaging';

-- -------------------------------------------------------------
-- 7. TABEL: products
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Harga jual (Rp)',
  \`cogs\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'HPP / Biaya Pokok (Rp)',
  \`stock\` INT NOT NULL DEFAULT 0 COMMENT 'Stok siap jual atau prep harian',
  \`min_stock\` INT NOT NULL DEFAULT 5,
  \`is_popular\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
  \`image_url\` TEXT NULL,
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_products_category\` (\`category\`),
  CONSTRAINT \`fk_products_category\` FOREIGN KEY (\`category\`) REFERENCES \`categories\` (\`code\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu dan produk kedai';

-- -------------------------------------------------------------
-- 8. TABEL: product_recipes
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`product_recipes\`;
CREATE TABLE \`product_recipes\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`product_id\` VARCHAR(50) NOT NULL,
  \`ingredient_id\` VARCHAR(50) NOT NULL,
  \`amount_required\` DECIMAL(12, 2) NOT NULL COMMENT 'Jumlah bahan per 1 porsi',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_product_ingredient\` (\`product_id\`, \`ingredient_id\`),
  KEY \`idx_recipes_ingredient\` (\`ingredient_id\`),
  CONSTRAINT \`fk_recipe_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_recipe_ingredient\` FOREIGN KEY (\`ingredient_id\`) REFERENCES \`ingredients\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Resep bahan baku menu';

-- -------------------------------------------------------------
-- 9. TABEL: transactions
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`transactions\`;
CREATE TABLE \`transactions\` (
  \`id\` VARCHAR(50) NOT NULL COMMENT 'Nomor Struk / Invoice (contoh: EFEK-001)',
  \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`cashier_id\` VARCHAR(50) NULL,
  \`cashier_name\` VARCHAR(100) NOT NULL,
  \`customer_name\` VARCHAR(100) NOT NULL DEFAULT 'Pelanggan',
  \`order_type\` ENUM('Dine In', 'Take Away') NOT NULL DEFAULT 'Dine In',
  \`table_number\` VARCHAR(50) NULL,
  \`subtotal\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`discount_name\` VARCHAR(100) NULL,
  \`tax\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'PB1 Restoran 10%',
  \`total_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`total_cogs\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`payment_method\` ENUM('TUNAI', 'QRIS', 'DEBIT', 'TRANSFER') NOT NULL DEFAULT 'TUNAI',
  \`amount_paid\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`change_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
  \`refund_reason\` TEXT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_tx_timestamp\` (\`timestamp\`),
  KEY \`idx_tx_status\` (\`status\`),
  KEY \`idx_tx_cashier\` (\`cashier_id\`),
  CONSTRAINT \`fk_tx_cashier\` FOREIGN KEY (\`cashier_id\`) REFERENCES \`cashier_accounts\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header transaksi penjualan kasir';

-- -------------------------------------------------------------
-- 10. TABEL: transaction_items
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`transaction_items\`;
CREATE TABLE \`transaction_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`transaction_id\` VARCHAR(50) NOT NULL,
  \`product_id\` VARCHAR(50) NULL,
  \`product_name\` VARCHAR(150) NOT NULL,
  \`category\` VARCHAR(50) NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`cogs\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`total_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`temperature\` VARCHAR(20) NULL COMMENT 'Hot / Iced',
  \`sugar_level\` VARCHAR(20) NULL COMMENT '100% / 70% / 50% / 0%',
  \`milk_option\` VARCHAR(50) NULL COMMENT 'Reguler / Oatmilk',
  \`extra_shot\` TINYINT(1) DEFAULT 0,
  \`notes\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_items_transaction\` (\`transaction_id\`),
  KEY \`idx_items_product\` (\`product_id\`),
  CONSTRAINT \`fk_item_transaction\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`transactions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_item_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Item detail pesanan per transaksi';

-- -------------------------------------------------------------
-- 11. TABEL: stock_mutations
-- -------------------------------------------------------------
DROP TABLE IF EXISTS \`stock_mutations\`;
CREATE TABLE \`stock_mutations\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`item_id\` VARCHAR(50) NOT NULL,
  \`item_type\` ENUM('PRODUCT', 'INGREDIENT') NOT NULL DEFAULT 'INGREDIENT',
  \`item_name\` VARCHAR(150) NOT NULL,
  \`type\` ENUM('IN', 'OUT', 'SALE', 'WASTE', 'REFUND') NOT NULL,
  \`quantity\` DECIMAL(12, 2) NOT NULL,
  \`unit\` VARCHAR(20) NOT NULL,
  \`notes\` TEXT NULL,
  \`reference_id\` VARCHAR(50) NULL COMMENT 'Nomor transaksi atau nomor faktur restock',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_mut_item\` (\`item_id\`),
  KEY \`idx_mut_timestamp\` (\`timestamp\`),
  KEY \`idx_mut_type\` (\`type\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kartu log mutasi stok barang';

-- -------------------------------------------------------------
-- 12. VIEWS (TAMPILAN ANALITIK & LAPORAN)
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW \`v_daily_sales_summary\` AS
SELECT 
    DATE(\`timestamp\`) AS \`sale_date\`,
    COUNT(\`id\`) AS \`total_orders\`,
    SUM(\`total_amount\`) AS \`total_revenue\`,
    SUM(\`total_cogs\`) AS \`total_cogs\`,
    SUM(\`total_amount\` - \`total_cogs\`) AS \`gross_profit\`,
    SUM(CASE WHEN \`payment_method\` = 'TUNAI' THEN \`total_amount\` ELSE 0 END) AS \`cash_revenue\`,
    SUM(CASE WHEN \`payment_method\` = 'QRIS' THEN \`total_amount\` ELSE 0 END) AS \`qris_revenue\`,
    SUM(CASE WHEN \`payment_method\` = 'DEBIT' THEN \`total_amount\` ELSE 0 END) AS \`debit_revenue\`,
    SUM(CASE WHEN \`payment_method\` = 'TRANSFER' THEN \`total_amount\` ELSE 0 END) AS \`transfer_revenue\`
FROM \`transactions\`
WHERE \`status\` = 'COMPLETED'
GROUP BY DATE(\`timestamp\`)
ORDER BY \`sale_date\` DESC;

CREATE OR REPLACE VIEW \`v_low_stock_alerts\` AS
SELECT 
    'INGREDIENT' AS \`item_type\`,
    \`id\`,
    \`name\`,
    \`category\`,
    \`stock\`,
    \`min_stock\`,
    \`unit\`,
    (\`stock\` - \`min_stock\`) AS \`stock_diff\`,
    CASE WHEN \`stock\` <= \`min_stock\` THEN 'CRITICAL' ELSE 'SAFE' END AS \`alert_status\`
FROM \`ingredients\`
WHERE \`stock\` <= \`min_stock\`
UNION ALL
SELECT 
    'PRODUCT' AS \`item_type\`,
    \`id\`,
    \`name\`,
    \`category\`,
    CAST(\`stock\` AS DECIMAL(12,2)),
    CAST(\`min_stock\` AS DECIMAL(12,2)),
    'pcs' AS \`unit\`,
    CAST((\`stock\` - \`min_stock\`) AS DECIMAL(12,2)) AS \`stock_diff\`,
    CASE WHEN \`stock\` <= \`min_stock\` THEN 'CRITICAL' ELSE 'SAFE' END AS \`alert_status\`
FROM \`products\`
WHERE \`stock\` <= \`min_stock\`;

CREATE OR REPLACE VIEW \`v_top_selling_products\` AS
SELECT 
    ti.\`product_name\`,
    ti.\`category\`,
    SUM(ti.\`quantity\`) AS \`total_sold\`,
    SUM(ti.\`total_price\`) AS \`total_revenue\`,
    SUM(ti.\`cogs\` * ti.\`quantity\`) AS \`total_cogs\`,
    SUM(ti.\`total_price\` - (ti.\`cogs\` * ti.\`quantity\`)) AS \`estimated_profit\`
FROM \`transaction_items\` ti
JOIN \`transactions\` t ON ti.\`transaction_id\` = t.\`id\`
WHERE t.\`status\` = 'COMPLETED'
GROUP BY ti.\`product_name\`, ti.\`category\`
ORDER BY \`total_sold\` DESC;

-- =============================================================
-- DATA ENTRI AKTIF (LIVE DATA ROWS)
-- =============================================================
`;

  // Branding
  const b = data.branding;
  sql += `
-- Data: shop_branding
INSERT INTO \`shop_branding\` (\`id\`, \`store_name\`, \`tagline\`, \`title_bar_text\`, \`logo_type\`, \`preset_icon\`, \`custom_logo_url\`, \`address\`, \`instagram\`) VALUES
(1, ${escapeSqlString(b.storeName)}, ${escapeSqlString(b.tagline)}, ${escapeSqlString(b.titleBarText)}, ${escapeSqlString(b.logoType)}, ${escapeSqlString(b.presetIcon)}, ${escapeSqlString(b.customLogoUrl)}, ${escapeSqlString(b.address)}, ${escapeSqlString(b.instagram)});

-- Data: categories
INSERT INTO \`categories\` (\`code\`, \`name\`, \`description\`) VALUES
('signature', 'Signature Coffee', 'Minuman racikan khas kreasi kedai Efek Kafein'),
('coffee', 'Classic Coffee', 'Espresso, Americano, Latte, dan manual brew filter'),
('non-coffee', 'Non-Coffee', 'Matcha, Artisan Chocolate, dan aneka minuman segar'),
('food', 'Pastry & Food', 'Roti brioche bakar, artisan croissant butter garing'),
('beans', 'Coffee Beans', 'Biji kopi fresh roast kemasan 250g untuk seduh rumahan');

-- Data: admin_users (Default passwords: admin123 & supervisor123)
INSERT INTO \`admin_users\` (\`id\`, \`username\`, \`password_hash\`, \`name\`, \`role\`, \`is_active\`) VALUES
(1, 'admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UDfa', 'Owner Efek Kafein', 'Owner / Manajer', 1),
(2, 'supervisor', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1C.K5R7e5D2305l8QyE8Pq1uYq.t7x2', 'Supervisor Operasional', 'Supervisor', 1);
`;

  // Cashier Accounts
  if (data.cashierAccounts.length > 0) {
    sql += `\n-- Data: cashier_accounts\nINSERT INTO \`cashier_accounts\` (\`id\`, \`username\`, \`name\`, \`pin\`, \`is_active\`, \`created_at\`, \`last_login\`) VALUES\n`;
    const rows = data.cashierAccounts.map((c) => {
      return `(${escapeSqlString(c.id)}, ${escapeSqlString(c.username)}, ${escapeSqlString(c.name)}, ${escapeSqlString(c.pin)}, ${c.isActive ? 1 : 0}, ${formatSqlDateTime(c.createdAt)}, ${c.lastLogin ? formatSqlDateTime(c.lastLogin) : 'NULL'})`;
    });
    sql += rows.join(',\n') + ';\n';
  }

  // Ingredients
  if (data.ingredients.length > 0) {
    sql += `\n-- Data: ingredients\nINSERT INTO \`ingredients\` (\`id\`, \`name\`, \`category\`, \`unit\`, \`stock\`, \`min_stock\`, \`cost_per_unit\`) VALUES\n`;
    const rows = data.ingredients.map((ing) => {
      return `(${escapeSqlString(ing.id)}, ${escapeSqlString(ing.name)}, ${escapeSqlString(ing.category)}, ${escapeSqlString(ing.unit)}, ${Number(ing.stock).toFixed(2)}, ${Number(ing.minStock).toFixed(2)}, ${Number(ing.costPerUnit).toFixed(2)})`;
    });
    sql += rows.join(',\n') + ';\n';
  }

  // Products
  if (data.products.length > 0) {
    sql += `\n-- Data: products\nINSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`price\`, \`cogs\`, \`stock\`, \`min_stock\`, \`is_popular\`, \`is_available\`, \`image_url\`, \`description\`) VALUES\n`;
    const rows = data.products.map((p) => {
      return `(${escapeSqlString(p.id)}, ${escapeSqlString(p.name)}, ${escapeSqlString(p.category)}, ${Number(p.price).toFixed(2)}, ${Number(p.cogs).toFixed(2)}, ${Math.floor(p.stock)}, ${Math.floor(p.minStock)}, ${p.isPopular ? 1 : 0}, 1, ${escapeSqlString(p.image)}, ${escapeSqlString(p.description)})`;
    });
    sql += rows.join(',\n') + ';\n';

    // Product recipes
    const recipeRows: string[] = [];
    data.products.forEach((p) => {
      if (p.recipe && p.recipe.length > 0) {
        p.recipe.forEach((r) => {
          recipeRows.push(`(${escapeSqlString(p.id)}, ${escapeSqlString(r.ingredientId)}, ${Number(r.amountRequired).toFixed(2)})`);
        });
      }
    });

    if (recipeRows.length > 0) {
      sql += `\n-- Data: product_recipes\nINSERT INTO \`product_recipes\` (\`product_id\`, \`ingredient_id\`, \`amount_required\`) VALUES\n`;
      sql += recipeRows.join(',\n') + ';\n';
    }
  }

  // Transactions & Transaction Items
  if (data.transactions.length > 0) {
    sql += `\n-- Data: transactions\nINSERT INTO \`transactions\` (\`id\`, \`timestamp\`, \`cashier_id\`, \`cashier_name\`, \`customer_name\`, \`order_type\`, \`table_number\`, \`subtotal\`, \`discount\`, \`discount_name\`, \`tax\`, \`total_amount\`, \`total_cogs\`, \`payment_method\`, \`amount_paid\`, \`change_amount\`, \`status\`, \`refund_reason\`) VALUES\n`;
    const txRows = data.transactions.map((t) => {
      return `(${escapeSqlString(t.id)}, ${formatSqlDateTime(t.timestamp)}, NULL, ${escapeSqlString(t.cashierName)}, ${escapeSqlString(t.customerName)}, ${escapeSqlString(t.orderType)}, ${escapeSqlString(t.tableNumber)}, ${Number(t.subtotal).toFixed(2)}, ${Number(t.discount).toFixed(2)}, ${escapeSqlString(t.discountName)}, ${Number(t.tax).toFixed(2)}, ${Number(t.totalAmount).toFixed(2)}, ${Number(t.totalCogs).toFixed(2)}, ${escapeSqlString(t.paymentMethod)}, ${Number(t.amountPaid).toFixed(2)}, ${Number(t.change).toFixed(2)}, ${escapeSqlString(t.status)}, ${escapeSqlString(t.refundReason)})`;
    });
    sql += txRows.join(',\n') + ';\n';

    // Items
    const itemRows: string[] = [];
    data.transactions.forEach((t) => {
      t.items.forEach((item) => {
        const cust = item.customization;
        const temp = cust?.temperature || null;
        const sugar = cust?.sugarLevel || null;
        const milk = cust?.milkOption || null;
        const extraShot = cust?.extraShot ? 1 : 0;
        const notes = cust?.notes || null;

        itemRows.push(
          `(${escapeSqlString(t.id)}, ${escapeSqlString(item.productId)}, ${escapeSqlString(item.productName)}, ${escapeSqlString(item.category)}, ${Math.floor(item.quantity)}, ${Number(item.price).toFixed(2)}, ${Number(item.cogs).toFixed(2)}, ${Number(item.totalPrice).toFixed(2)}, ${escapeSqlString(temp)}, ${escapeSqlString(sugar)}, ${escapeSqlString(milk)}, ${extraShot}, ${escapeSqlString(notes)})`
        );
      });
    });

    if (itemRows.length > 0) {
      sql += `\n-- Data: transaction_items\nINSERT INTO \`transaction_items\` (\`transaction_id\`, \`product_id\`, \`product_name\`, \`category\`, \`quantity\`, \`price\`, \`cogs\`, \`total_price\`, \`temperature\`, \`sugar_level\`, \`milk_option\`, \`extra_shot\`, \`notes\`) VALUES\n`;
      sql += itemRows.join(',\n') + ';\n';
    }
  }

  // Stock Mutations
  if (data.mutations.length > 0) {
    sql += `\n-- Data: stock_mutations\nINSERT INTO \`stock_mutations\` (\`id\`, \`timestamp\`, \`item_id\`, \`item_type\`, \`item_name\`, \`type\`, \`quantity\`, \`unit\`, \`notes\`, \`reference_id\`) VALUES\n`;
    const mutRows = data.mutations.map((m) => {
      const itemType = m.itemId.startsWith('ing-') ? 'INGREDIENT' : 'PRODUCT';
      return `(${escapeSqlString(m.id)}, ${formatSqlDateTime(m.timestamp)}, ${escapeSqlString(m.itemId)}, '${itemType}', ${escapeSqlString(m.itemName)}, ${escapeSqlString(m.type)}, ${Number(m.quantity).toFixed(2)}, ${escapeSqlString(m.unit)}, ${escapeSqlString(m.notes)}, ${escapeSqlString(m.referenceId)})`;
    });
    sql += mutRows.join(',\n') + ';\n';
  }

  sql += `
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- =====================================================================
-- SELESAI: Dump database kedai_kopi_efek_kafein siap di-upload ke MySQL!
-- =====================================================================
`;

  return sql;
}

/**
 * Triggers file download in client browser
 */
export function downloadSqlFile(sqlContent: string, filename = 'kedai_kopi_mysql.sql'): void {
  const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
