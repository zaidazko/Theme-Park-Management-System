-- ThrillWorld Merchandise - Starter Collection (Quick Test)
-- This is a curated selection of 20 popular items to test the functionality

-- Clear existing merchandise (optional - comment out if you want to keep existing items)
-- DELETE FROM commodity_type WHERE Category = 'merchandise';

-- ====================
-- APPAREL (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Classic Logo Tee', 24.99, 1, 150, 'merchandise'),
('Steel Dragon Pullover Hoodie', 49.99, 1, 60, 'merchandise'),
('Glow-in-Dark Coaster Track Hoodie', 59.99, 1, 40, 'merchandise'),
('ThrillWorld Windbreaker Jacket', 44.99, 1, 50, 'merchandise'),
('Limited Edition 30th Anniversary Hoodie', 64.99, 1, 25, 'merchandise');

-- ====================
-- ACCESSORIES (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Snapback Cap', 24.99, 1, 100, 'merchandise'),
('3D Coaster Track Keychain', 9.99, 1, 200, 'merchandise'),
('Collector Pin Set (5-Pack)', 34.99, 1, 50, 'merchandise'),
('ThrillWorld Mini Backpack', 39.99, 1, 70, 'merchandise'),
('Light-Up Coaster Car Keychain', 14.99, 1, 120, 'merchandise');

-- ====================
-- TOYS & COLLECTIBLES (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise'),
('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise'),
('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise'),
('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise'),
('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise');

-- ====================
-- HOME & LIFESTYLE (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('ThrillWorld Ceramic Coffee Mug', 16.99, 1, 110, 'merchandise'),
('Steel Dragon Insulated Tumbler', 29.99, 1, 75, 'merchandise'),
('LED Neon Sign - ThrillWorld Logo', 79.99, 1, 15, 'merchandise'),
('Throw Blanket - Park Map Design', 39.99, 1, 40, 'merchandise'),
('Souvenir Refillable Cup (Park Special)', 19.99, 1, 200, 'merchandise');

-- ====================
-- Test with a few out-of-stock items
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category)
VALUES
('SOLD OUT - Steel Dragon "I Survived" Tee', 26.99, 1, 0, 'merchandise'),
('LOW STOCK - Crystal Coaster Sculpture', 89.99, 1, 3, 'merchandise');

-- ====================
-- TOTAL: 22 items for quick testing
-- ====================

-- Query to verify the insert
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Base_Price,
    Stock_Quantity,
    Category
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Base_Price;
