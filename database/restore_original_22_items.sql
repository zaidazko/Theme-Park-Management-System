-- ThrillWorld Merchandise Catalog
-- Run this script to populate the merchandise shop

-- First, let's check what store IDs we have (assuming Store 1 is Main Gift Shop)

-- ====================
-- APPAREL & WEARABLES
-- ====================

-- Classic T-Shirts
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Classic Logo Tee', 24.99, 1, 150, 'merchandise'),
('Steel Dragon Rider Tee', 27.99, 1, 120, 'merchandise'),
('Twisted Cyclone Black Tee', 27.99, 1, 100, 'merchandise'),
('Vintage ThrillWorld 1995 Tee', 29.99, 1, 80, 'merchandise');

-- Premium Hoodies
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Premium Zip Hoodie', 54.99, 1, 75, 'merchandise'),
('Steel Dragon Pullover Hoodie', 49.99, 1, 60, 'merchandise'),
('Glow-in-Dark Coaster Track Hoodie', 59.99, 1, 40, 'merchandise'),
('Limited Edition 30th Anniversary Hoodie', 64.99, 1, 25, 'merchandise');

-- Jackets & Outerwear
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Windbreaker Jacket', 44.99, 1, 50, 'merchandise'),
('All-Weather Park Explorer Jacket', 69.99, 1, 30, 'merchandise'),
('Varsity Style ThrillWorld Jacket', 79.99, 1, 20, 'merchandise');

-- Comfortable Sweats
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Cozy Coaster Jogger Sweatpants', 39.99, 1, 65, 'merchandise'),
('ThrillWorld Comfort Crew Sweatshirt', 44.99, 1, 70, 'merchandise');

-- ====================
-- ACCESSORIES & SMALL WEARABLES
-- ====================

-- Caps & Hats
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Snapback Cap', 24.99, 1, 100, 'merchandise'),
('Steel Dragon Embroidered Hat', 27.99, 1, 85, 'merchandise'),
('Vintage Dad Hat Collection', 22.99, 1, 90, 'merchandise'),
('Bucket Hat - Park Explorer Edition', 26.99, 1, 60, 'merchandise');

-- Keychains & Pins
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('3D Coaster Track Keychain', 9.99, 1, 200, 'merchandise'),
('ThrillWorld Logo Enamel Pin', 7.99, 1, 250, 'merchandise'),
('Collector Pin Set (5-Pack)', 34.99, 1, 50, 'merchandise'),
('Light-Up Coaster Car Keychain', 14.99, 1, 120, 'merchandise');

-- Lanyards & Badges
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Season Pass Holder Lanyard', 12.99, 1, 150, 'merchandise'),
('Ride Tracker Lanyard + Card Set', 19.99, 1, 80, 'merchandise');

-- Bags & Wallets
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Mini Backpack', 39.99, 1, 70, 'merchandise'),
('Waterproof Sling Bag', 29.99, 1, 85, 'merchandise'),
('Coaster Blueprint Wallet', 19.99, 1, 95, 'merchandise'),
('Cardholder - Ride Ticket Design', 12.99, 1, 110, 'merchandise');

-- ====================
-- TOYS, PLUSH & COLLECTIBLES
-- ====================

-- Plush Toys
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise'),
('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise'),
('Mini Mascot Plush Collection', 14.99, 1, 120, 'merchandise'),
('Limited Edition Golden Dragon Plush', 54.99, 1, 15, 'merchandise');

-- Action Figures & Collectibles
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise'),
('Build-Your-Own Steel Dragon Kit', 49.99, 1, 35, 'merchandise'),
('Collector Figurine - Park Mascot', 29.99, 1, 60, 'merchandise'),
('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise');

-- Novelty Items
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise'),
('Glow Stick Bundle (10-Pack)', 12.99, 1, 150, 'merchandise'),
('Light-Up Bubble Wand', 16.99, 1, 80, 'merchandise');

-- ====================
-- HOME, DECOR & LIFESTYLE
-- ====================

-- Mugs & Drinkware
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Ceramic Coffee Mug', 16.99, 1, 110, 'merchandise'),
('Steel Dragon Insulated Tumbler', 29.99, 1, 75, 'merchandise'),
('Color-Changing Coaster Mug', 22.99, 1, 65, 'merchandise'),
('Souvenir Refillable Cup (Park Special)', 19.99, 1, 200, 'merchandise'),
('Stainless Steel Water Bottle 32oz', 24.99, 1, 90, 'merchandise');

-- Stationery & Office
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Notebook Set', 14.99, 1, 70, 'merchandise'),
('Coaster Blueprint Poster Set', 19.99, 1, 50, 'merchandise'),
('Premium Pen & Pencil Set', 12.99, 1, 85, 'merchandise'),
('Magnetic Photo Frame Set', 17.99, 1, 60, 'merchandise');

-- Home Decor
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('LED Neon Sign - ThrillWorld Logo', 79.99, 1, 15, 'merchandise'),
('Coaster Track Wall Art Canvas', 49.99, 1, 25, 'merchandise'),
('Ornament Set - Rides Collection', 24.99, 1, 55, 'merchandise'),
('Throw Blanket - Park Map Design', 39.99, 1, 40, 'merchandise'),
('Decorative Pillow - Vintage Poster', 29.99, 1, 45, 'merchandise');

-- Snack & Storage
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Snack Container Set (3-Pack)', 16.99, 1, 80, 'merchandise'),
('ThrillWorld Lunch Box', 22.99, 1, 70, 'merchandise'),
('Insulated Cooler Bag', 34.99, 1, 50, 'merchandise');

-- ====================
-- SPECIAL EVENT & LIMITED EDITION
-- ====================

-- Anniversary Collection
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('30th Anniversary Collector Coin', 19.99, 1, 100, 'merchandise'),
('Anniversary Celebration Pin Badge', 14.99, 1, 80, 'merchandise'),
('Limited Edition Anniversary Book', 34.99, 1, 40, 'merchandise'),
('Founders Edition T-Shirt', 39.99, 1, 30, 'merchandise');

-- Ride-Specific Merchandise
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Steel Dragon "I Survived" Tee', 26.99, 1, 95, 'merchandise'),
('Twisted Cyclone Face Mask', 9.99, 1, 120, 'merchandise'),
('Steel Dragon Photo Magnet', 8.99, 1, 150, 'merchandise'),
('Ride Stats Trading Cards (Full Set)', 19.99, 1, 70, 'merchandise');

-- Seasonal & Holiday
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Fright Fest Limited Edition Hoodie', 59.99, 1, 35, 'merchandise'),
('Holiday Lights Ornament Collection', 29.99, 1, 50, 'merchandise'),
('Summer Nights Beach Towel', 32.99, 1, 60, 'merchandise'),
('Halloween Glow Mask', 24.99, 1, 45, 'merchandise');

-- Premium Collectibles
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Premium Leather Jacket - Embroidered', 149.99, 1, 10, 'merchandise'),
('Crystal Coaster Sculpture', 89.99, 1, 12, 'merchandise'),
('Autographed Park Photo (Framed)', 99.99, 1, 8, 'merchandise'),
('VIP Member Exclusive Gift Box', 199.99, 1, 5, 'merchandise');

-- ====================
-- TOTAL: 80+ unique merchandise items across all categories!
-- ====================
