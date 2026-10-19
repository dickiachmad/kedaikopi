-- =====================================================================
-- DATABASE SCHEMA & SEED DATA UNTUK KEDAI KOPI EFEK KAFEIN
-- Target Engine  : MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- Format         : SQL Dump (UTF-8 Unicode)
-- Kompatibilitas : phpMyAdmin, MySQL Workbench, DBeaver, Navicat, CLI
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
CREATE DATABASE IF NOT EXISTS `kedai_kopi_efek_kafein`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `kedai_kopi_efek_kafein`;

-- -------------------------------------------------------------
-- 2. STRUKTUR TABEL: shop_branding
--    Menyimpan profil, logo, identitas toko, dan title bar
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `shop_branding`;
CREATE TABLE `shop_branding` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `store_name` VARCHAR(150) NOT NULL DEFAULT 'Efek Kafein',
  `tagline` VARCHAR(255) DEFAULT 'Sistem Penjualan & Inventaris Real-time',
  `title_bar_text` VARCHAR(255) DEFAULT 'Kedai Kopi Efek Kafein',
  `logo_type` ENUM('preset', 'custom') NOT NULL DEFAULT 'preset',
  `preset_icon` VARCHAR(50) NOT NULL DEFAULT 'Coffee',
  `custom_logo_url` TEXT NULL,
  `address` VARCHAR(255) DEFAULT 'Jl. Kafein Boulevard No. 18, Jakarta',
  `instagram` VARCHAR(100) DEFAULT '@efekkafein.id',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pengaturan branding kedai kopi';

-- -------------------------------------------------------------
-- 3. STRUKTUR TABEL: categories
--    Kategori menu produk
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kategori produk kedai';

-- -------------------------------------------------------------
-- 4. STRUKTUR TABEL: admin_users
--    Data pengguna manajemen/supervisor kedai
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Owner / Manajer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun login admin dan manajer';

-- -------------------------------------------------------------
-- 5. STRUKTUR TABEL: cashier_accounts
--    Daftar akun kasir dengan PIN untuk akses POS
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `cashier_accounts`;
CREATE TABLE `cashier_accounts` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `pin` VARCHAR(20) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cashier_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Akun kasir dan barista POS';

-- -------------------------------------------------------------
-- 6. STRUKTUR TABEL: ingredients
--    Daftar bahan baku (biji kopi, susu, sirup, cup, dll)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE `ingredients` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('beans', 'dairy', 'syrup', 'powder', 'packaging') NOT NULL,
  `unit` ENUM('gram', 'ml', 'pcs', 'kg', 'liter') NOT NULL,
  `stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `min_stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `cost_per_unit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Harga beli per unit (Rp)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ingredients_category` (`category`),
  KEY `idx_ingredients_stock` (`stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stok bahan baku & packaging';

-- -------------------------------------------------------------
-- 7. STRUKTUR TABEL: products
--    Katalog menu siap jual beserta HPP (COGS) dan harga jual
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Harga jual (Rp)',
  `cogs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'HPP / Biaya Pokok (Rp)',
  `stock` INT NOT NULL DEFAULT 0 COMMENT 'Stok siap jual atau prep harian',
  `min_stock` INT NOT NULL DEFAULT 5,
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `image_url` TEXT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category`) REFERENCES `categories` (`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Menu dan produk kedai';

-- -------------------------------------------------------------
-- 8. STRUKTUR TABEL: product_recipes
--    Resep Bill of Materials (BOM) pemakaian bahan per produk
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `product_recipes`;
CREATE TABLE `product_recipes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` VARCHAR(50) NOT NULL,
  `ingredient_id` VARCHAR(50) NOT NULL,
  `amount_required` DECIMAL(12, 2) NOT NULL COMMENT 'Jumlah bahan per 1 porsi produk',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_ingredient` (`product_id`, `ingredient_id`),
  KEY `idx_recipes_ingredient` (`ingredient_id`),
  CONSTRAINT `fk_recipe_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Resep bahan baku menu';

-- -------------------------------------------------------------
-- 9. STRUKTUR TABEL: transactions
--    Header transaksi penjualan POS
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Nomor Struk / Invoice (contoh: EFEK-001)',
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cashier_id` VARCHAR(50) NULL,
  `cashier_name` VARCHAR(100) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL DEFAULT 'Pelanggan',
  `order_type` ENUM('Dine In', 'Take Away') NOT NULL DEFAULT 'Dine In',
  `table_number` VARCHAR(50) NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount_name` VARCHAR(100) NULL,
  `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'PB1 Restoran 10%',
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_cogs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('TUNAI', 'QRIS', 'DEBIT', 'TRANSFER') NOT NULL DEFAULT 'TUNAI',
  `amount_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
  `refund_reason` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tx_timestamp` (`timestamp`),
  KEY `idx_tx_status` (`status`),
  KEY `idx_tx_cashier` (`cashier_id`),
  CONSTRAINT `fk_tx_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `cashier_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header transaksi penjualan kasir';

-- -------------------------------------------------------------
-- 10. STRUKTUR TABEL: transaction_items
--     Rincian menu yang dibeli, harga, HPP, & customisasi
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `transaction_items`;
CREATE TABLE `transaction_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `cogs` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `temperature` VARCHAR(20) NULL COMMENT 'Hot / Iced',
  `sugar_level` VARCHAR(20) NULL COMMENT '100% / 70% / 50% / 0%',
  `milk_option` VARCHAR(50) NULL COMMENT 'Reguler / Oatmilk',
  `extra_shot` TINYINT(1) DEFAULT 0,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_items_transaction` (`transaction_id`),
  KEY `idx_items_product` (`product_id`),
  CONSTRAINT `fk_item_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Item detail pesanan per transaksi';

-- -------------------------------------------------------------
-- 11. STRUKTUR TABEL: stock_mutations
--     Riwayat kartu stok (masuk, keluar, penjualan, waste, retur)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `stock_mutations`;
CREATE TABLE `stock_mutations` (
  `id` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `item_id` VARCHAR(50) NOT NULL,
  `item_type` ENUM('PRODUCT', 'INGREDIENT') NOT NULL DEFAULT 'INGREDIENT',
  `item_name` VARCHAR(150) NOT NULL,
  `type` ENUM('IN', 'OUT', 'SALE', 'WASTE', 'REFUND') NOT NULL,
  `quantity` DECIMAL(12, 2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `notes` TEXT NULL,
  `reference_id` VARCHAR(50) NULL COMMENT 'Nomor transaksi atau nomor faktur restock',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mut_item` (`item_id`),
  KEY `idx_mut_timestamp` (`timestamp`),
  KEY `idx_mut_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kartu log mutasi stok barang';

-- -------------------------------------------------------------
-- 12. VIEWS (TAMPILAN ANALITIK & LAPORAN)
-- -------------------------------------------------------------

-- View Laporan Ringkasan Penjualan Harian
CREATE OR REPLACE VIEW `v_daily_sales_summary` AS
SELECT 
    DATE(`timestamp`) AS `sale_date`,
    COUNT(`id`) AS `total_orders`,
    SUM(`total_amount`) AS `total_revenue`,
    SUM(`total_cogs`) AS `total_cogs`,
    SUM(`total_amount` - `total_cogs`) AS `gross_profit`,
    SUM(CASE WHEN `payment_method` = 'TUNAI' THEN `total_amount` ELSE 0 END) AS `cash_revenue`,
    SUM(CASE WHEN `payment_method` = 'QRIS' THEN `total_amount` ELSE 0 END) AS `qris_revenue`,
    SUM(CASE WHEN `payment_method` = 'DEBIT' THEN `total_amount` ELSE 0 END) AS `debit_revenue`,
    SUM(CASE WHEN `payment_method` = 'TRANSFER' THEN `total_amount` ELSE 0 END) AS `transfer_revenue`
FROM `transactions`
WHERE `status` = 'COMPLETED'
GROUP BY DATE(`timestamp`)
ORDER BY `sale_date` DESC;

-- View Bahan Baku Menipis (Stok <= Min Stok)
CREATE OR REPLACE VIEW `v_low_stock_alerts` AS
SELECT 
    'INGREDIENT' AS `item_type`,
    `id`,
    `name`,
    `category`,
    `stock`,
    `min_stock`,
    `unit`,
    (`stock` - `min_stock`) AS `stock_diff`,
    CASE WHEN `stock` <= `min_stock` THEN 'CRITICAL' ELSE 'SAFE' END AS `alert_status`
FROM `ingredients`
WHERE `stock` <= `min_stock`
UNION ALL
SELECT 
    'PRODUCT' AS `item_type`,
    `id`,
    `name`,
    `category`,
    CAST(`stock` AS DECIMAL(12,2)),
    CAST(`min_stock` AS DECIMAL(12,2)),
    'pcs' AS `unit`,
    CAST((`stock` - `min_stock`) AS DECIMAL(12,2)) AS `stock_diff`,
    CASE WHEN `stock` <= `min_stock` THEN 'CRITICAL' ELSE 'SAFE' END AS `alert_status`
FROM `products`
WHERE `stock` <= `min_stock`;

-- View Produk Terlaris (Top Selling)
CREATE OR REPLACE VIEW `v_top_selling_products` AS
SELECT 
    ti.`product_name`,
    ti.`category`,
    SUM(ti.`quantity`) AS `total_sold`,
    SUM(ti.`total_price`) AS `total_revenue`,
    SUM(ti.`cogs` * ti.`quantity`) AS `total_cogs`,
    SUM(ti.`total_price` - (ti.`cogs` * ti.`quantity`)) AS `estimated_profit`
FROM `transaction_items` ti
JOIN `transactions` t ON ti.`transaction_id` = t.`id`
WHERE t.`status` = 'COMPLETED'
GROUP BY ti.`product_name`, ti.`category`
ORDER BY `total_sold` DESC;

-- =============================================================
-- DATA AWAL (SEED DATA / INITIAL RECORDS)
-- =============================================================

-- Seed Data: shop_branding
INSERT INTO `shop_branding` (`id`, `store_name`, `tagline`, `title_bar_text`, `logo_type`, `preset_icon`, `custom_logo_url`, `address`, `instagram`) VALUES
(1, 'Efek Kafein', 'Sistem Penjualan & Inventaris Real-time', 'Kedai Kopi Efek Kafein', 'preset', 'Coffee', '', 'Jl. Kafein Boulevard No. 18, Jakarta', '@efekkafein.id');

-- Seed Data: categories
INSERT INTO `categories` (`code`, `name`, `description`) VALUES
('signature', 'Signature Coffee', 'Minuman racikan khas kreasi kedai Efek Kafein'),
('coffee', 'Classic Coffee', 'Espresso, Americano, Latte, dan manual brew filter'),
('non-coffee', 'Non-Coffee', 'Matcha, Artisan Chocolate, dan aneka minuman segar'),
('food', 'Pastry & Food', 'Roti brioche bakar, artisan croissant butter garing'),
('beans', 'Coffee Beans', 'Biji kopi fresh roast kemasan 250g untuk seduh rumahan');

-- Seed Data: admin_users (Password default: admin123 & supervisor123)
INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `name`, `role`, `is_active`) VALUES
(1, 'admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UDfa', 'Owner Efek Kafein', 'Owner / Manajer', 1),
(2, 'supervisor', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1C.K5R7e5D2305l8QyE8Pq1uYq.t7x2', 'Supervisor Operasional', 'Supervisor', 1);

-- Seed Data: cashier_accounts (PIN default: 1234)
INSERT INTO `cashier_accounts` (`id`, `username`, `name`, `pin`, `is_active`, `created_at`, `last_login`) VALUES
('csh-1', 'arya', 'Barista Arya', '1234', 1, '2026-03-01 08:00:00', '2026-03-18 07:30:00'),
('csh-2', 'maya', 'Barista Maya', '1234', 1, '2026-03-05 08:00:00', '2026-03-17 14:15:00'),
('csh-3', 'budi', 'Barista Budi', '1234', 1, '2026-03-10 08:00:00', '2026-03-16 09:00:00');

-- Seed Data: ingredients
INSERT INTO `ingredients` (`id`, `name`, `category`, `unit`, `stock`, `min_stock`, `cost_per_unit`) VALUES
('ing-1', 'Biji Kopi House Blend (Arabica-Robusta)', 'beans', 'gram', 7500.00, 1500.00, 220.00),
('ing-2', 'Biji Kopi Single Origin Flores', 'beans', 'gram', 2200.00, 800.00, 350.00),
('ing-3', 'Susu Fresh Milk Pasteurisasi', 'dairy', 'ml', 11000.00, 2500.00, 22.00),
('ing-4', 'Oat Milk Barista Edition', 'dairy', 'ml', 3500.00, 1000.00, 48.00),
('ing-5', 'Sirup Gula Aren Organik', 'syrup', 'ml', 3200.00, 600.00, 35.00),
('ing-6', 'Sirup Karamel Gourmet', 'syrup', 'ml', 1800.00, 400.00, 50.00),
('ing-7', 'Bubuk Pure Uji Matcha', 'powder', 'gram', 850.00, 250.00, 400.00),
('ing-8', 'Bubuk Cokelat Artisan', 'powder', 'gram', 1400.00, 300.00, 180.00),
('ing-9', 'Cup Dingin 16oz + Sedotan Ramah Lingkungan', 'packaging', 'pcs', 280.00, 60.00, 850.00),
('ing-10', 'Paper Cup Panas 8oz + Sleeve', 'packaging', 'pcs', 140.00, 40.00, 750.00);

-- Seed Data: products
INSERT INTO `products` (`id`, `name`, `category`, `price`, `cogs`, `stock`, `min_stock`, `is_popular`, `is_available`, `image_url`, `description`) VALUES
('prod-1', 'Es Kopi Susu Kafein', 'signature', 23000.00, 7200.00, 65, 15, 1, 1, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', 'Signature espresso pekat dipadu susu creamy dan gula aren murni khas Efek Kafein.'),
('prod-2', 'Kafein Double Boost', 'signature', 28000.00, 8500.00, 35, 10, 1, 1, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 'Double shot ristretto di atas cold brew citrus menyegarkan untuk efek kafein maksimal.'),
('prod-3', 'Caramel Macchiato Kafein', 'signature', 30000.00, 9400.00, 28, 8, 1, 1, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80', 'Layered espresso dengan vanilla steamed milk dan saus drizzle karamel bakar.'),
('prod-4', 'Cafe Latte', 'coffee', 26000.00, 7800.00, 45, 12, 0, 1, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80', 'Espresso seimbang dengan microfoam susu lembut berhias latte art presisi.'),
('prod-5', 'Americano / Long Black', 'coffee', 22000.00, 4500.00, 55, 15, 0, 1, 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80', 'Double shot espresso dengan air mineral panas atau dingin, aroma notes nutty & chocolate.'),
('prod-6', 'Manual Brew V60 Flores', 'coffee', 28000.00, 6200.00, 22, 6, 0, 1, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80', 'Seduhan manual filter V60 dengan beans Flores Bajawa notes apel merah, caramel & floral.'),
('prod-7', 'Matcha Latte Uji', 'non-coffee', 26000.00, 8200.00, 30, 8, 0, 1, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80', 'Matcha grade ceremonial asli dipadu susu hangat atau dingin yang velvety.'),
('prod-8', 'Artisan Dark Chocolate', 'non-coffee', 25000.00, 7000.00, 28, 8, 0, 1, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80', 'Cokelat hitam pekat 70% dengan steamed milk dan taburan kakao nip.'),
('prod-9', 'Croissant Butter Artisan', 'food', 24000.00, 11000.00, 14, 5, 1, 1, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', 'Pastry renyah berlapis dengan aroma pure French butter, dihangatkan sebelum disajikan.'),
('prod-10', 'Roti Bakar Keju Meleleh', 'food', 20000.00, 8000.00, 18, 5, 0, 1, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', 'Roti brioche panggang garing dengan isian keju mozarella & cheddar melimpah.'),
('prod-11', 'Beans Efek Blend 250g', 'beans', 85000.00, 45000.00, 12, 3, 0, 1, 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80', 'Kemasan biji kopi sangrai fresh roast untuk seduh sendiri di rumah (Medium-Dark Roast).');

-- Seed Data: product_recipes (Pemakaian Bahan Baku / BOM)
INSERT INTO `product_recipes` (`product_id`, `ingredient_id`, `amount_required`) VALUES
('prod-1', 'ing-1', 18.00), -- 18g Biji Kopi House Blend
('prod-1', 'ing-3', 140.00), -- 140ml Fresh Milk
('prod-1', 'ing-5', 25.00), -- 25ml Gula Aren
('prod-1', 'ing-9', 1.00), -- 1 Cup Dingin 16oz
('prod-2', 'ing-1', 28.00), -- 28g Biji Kopi House Blend
('prod-2', 'ing-9', 1.00), -- 1 Cup Dingin 16oz
('prod-3', 'ing-1', 18.00), -- 18g Biji Kopi House Blend
('prod-3', 'ing-3', 160.00), -- 160ml Fresh Milk
('prod-3', 'ing-6', 30.00), -- 30ml Karamel
('prod-3', 'ing-9', 1.00), -- 1 Cup Dingin 16oz
('prod-4', 'ing-1', 18.00), -- 18g Biji Kopi
('prod-4', 'ing-3', 180.00), -- 180ml Fresh Milk
('prod-4', 'ing-10', 1.00), -- 1 Paper Cup 8oz
('prod-5', 'ing-1', 18.00), -- 18g Biji Kopi
('prod-5', 'ing-10', 1.00), -- 1 Paper Cup 8oz
('prod-6', 'ing-2', 16.00), -- 16g Single Origin Flores
('prod-6', 'ing-10', 1.00), -- 1 Paper Cup 8oz
('prod-7', 'ing-7', 12.00), -- 12g Pure Matcha
('prod-7', 'ing-3', 160.00), -- 160ml Fresh Milk
('prod-7', 'ing-9', 1.00), -- 1 Cup Dingin 16oz
('prod-8', 'ing-8', 25.00), -- 25g Artisan Cocoa
('prod-8', 'ing-3', 160.00), -- 160ml Fresh Milk
('prod-8', 'ing-9', 1.00); -- 1 Cup Dingin 16oz

-- Seed Data: transactions
INSERT INTO `transactions` (`id`, `timestamp`, `cashier_id`, `cashier_name`, `customer_name`, `order_type`, `table_number`, `subtotal`, `discount`, `discount_name`, `tax`, `total_amount`, `total_cogs`, `payment_method`, `amount_paid`, `change_amount`, `status`) VALUES
('EFEK-001', '2026-03-30 08:15:20', 'csh-1', 'Barista Arya', 'Dimas Pratama', 'Dine In', 'Meja 04', 70000.00, 0.00, NULL, 7000.00, 77000.00, 25400.00, 'QRIS', 77000.00, 0.00, 'COMPLETED'),
('EFEK-002', '2026-03-30 09:42:10', 'csh-1', 'Barista Arya', 'Sarah Amalia', 'Take Away', NULL, 36000.00, 0.00, NULL, 3600.00, 39600.00, 11500.00, 'TUNAI', 50000.00, 10400.00, 'COMPLETED'),
('EFEK-003', '2026-03-30 11:10:05', 'csh-1', 'Barista Arya', 'Fajar Nugraha', 'Dine In', 'Meja 01', 70000.00, 5000.00, 'Promo Morning Kafein', 6500.00, 71500.00, 21000.00, 'DEBIT', 71500.00, 0.00, 'COMPLETED'),
('EFEK-004', '2026-03-30 13:25:40', 'csh-1', 'Barista Arya', 'Kantor Tech Studio', 'Take Away', NULL, 144000.00, 10000.00, 'Voucher Member Kafein', 13400.00, 147400.00, 45200.00, 'QRIS', 147400.00, 0.00, 'COMPLETED'),
('EFEK-005', '2026-03-30 15:05:15', 'csh-1', 'Barista Arya', 'Budi Santoso', 'Dine In', 'Bar 02', 113000.00, 0.00, NULL, 11300.00, 124300.00, 51200.00, 'TRANSFER', 124300.00, 0.00, 'COMPLETED');

-- Seed Data: transaction_items
INSERT INTO `transaction_items` (`transaction_id`, `product_id`, `product_name`, `category`, `quantity`, `price`, `cogs`, `total_price`, `temperature`, `sugar_level`, `milk_option`, `extra_shot`, `notes`) VALUES
('EFEK-001', 'prod-1', 'Es Kopi Susu Kafein', 'signature', 2, 23000.00, 7200.00, 46000.00, 'Iced', '70%', 'Reguler', 0, NULL),
('EFEK-001', 'prod-9', 'Croissant Butter Artisan', 'food', 1, 24000.00, 11000.00, 24000.00, NULL, NULL, NULL, 0, 'Hangatkan renyah'),
('EFEK-002', 'prod-3', 'Caramel Macchiato Kafein', 'signature', 1, 36000.00, 11500.00, 36000.00, 'Iced', '50%', 'Oatmilk (+Rp6k)', 0, 'Sedotan bambu'),
('EFEK-003', 'prod-2', 'Kafein Double Boost', 'signature', 1, 28000.00, 8500.00, 28000.00, 'Iced', '100%', 'Reguler', 0, NULL),
('EFEK-003', 'prod-5', 'Americano / Long Black', 'coffee', 1, 22000.00, 4500.00, 22000.00, 'Hot', '0%', 'Reguler', 0, NULL),
('EFEK-003', 'prod-10', 'Roti Bakar Keju Meleleh', 'food', 1, 20000.00, 8000.00, 20000.00, NULL, NULL, NULL, 0, NULL),
('EFEK-004', 'prod-1', 'Es Kopi Susu Kafein', 'signature', 4, 23000.00, 7200.00, 92000.00, 'Iced', '100%', 'Reguler', 0, 'Pisahkan es batu'),
('EFEK-004', 'prod-7', 'Matcha Latte Uji', 'non-coffee', 2, 26000.00, 8200.00, 52000.00, 'Iced', '70%', 'Reguler', 0, NULL),
('EFEK-005', 'prod-6', 'Manual Brew V60 Flores', 'coffee', 1, 28000.00, 6200.00, 28000.00, 'Hot', '0%', 'Reguler', 0, 'Ratio 1:15'),
('EFEK-005', 'prod-11', 'Beans Efek Blend 250g', 'beans', 1, 85000.00, 45000.00, 85000.00, NULL, NULL, NULL, 0, 'Biji utuh (Whole Bean)');

-- Seed Data: stock_mutations
INSERT INTO `stock_mutations` (`id`, `timestamp`, `item_id`, `item_type`, `item_name`, `type`, `quantity`, `unit`, `notes`, `reference_id`) VALUES
('mut-1', '2026-03-30 06:30:00', 'ing-1', 'INGREDIENT', 'Biji Kopi House Blend (Arabica-Robusta)', 'IN', 5000.00, 'gram', 'Restock mingguan dari roastery mitra', 'PO-202603-01'),
('mut-2', '2026-03-30 07:00:00', 'ing-3', 'INGREDIENT', 'Susu Fresh Milk Pasteurisasi', 'IN', 10000.00, 'ml', 'Penerimaan pasokan susu pasteurisasi pagi', 'INV-DAIRY-88'),
('mut-3', '2026-03-30 11:45:00', 'prod-9', 'PRODUCT', 'Croissant Butter Artisan', 'WASTE', 1.00, 'pcs', 'Afkir gosong saat pemanasan oven', NULL);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- =====================================================================
-- SELESAI: Database kedai_kopi_efek_kafein siap digunakan di MySQL!
-- =====================================================================
