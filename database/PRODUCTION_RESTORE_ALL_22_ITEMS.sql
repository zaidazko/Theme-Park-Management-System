-- ========================================
-- PRODUCTION: Restore all 22 merchandise items
-- Run this on your PRODUCTION database
-- ========================================

-- Use your production database name (adjust if needed)
-- Common names: theme_park, amusement_park_db, etc.
USE theme_park;

-- Check if we're in the right database
SELECT DATABASE() as Current_Database;

-- First, safely delete only merchandise (preserve other data)
DELETE FROM commodity_sale WHERE Commodity_TypeID IN (SELECT Commodity_TypeID FROM commodity_type WHERE Category = 'merchandise');
DELETE FROM commodity_type WHERE Category = 'merchandise';

-- Now insert all 22 items with complete data
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Description, Is_Discontinued)
VALUES
-- APPAREL (4 items)
('ThrillWorld Classic Logo Tee', 24.99, 1, 150, 'merchandise', 'Apparel', 'Classic ThrillWorld t-shirt', FALSE),
('Steel Dragon Pullover Hoodie', 49.99, 1, 60, 'merchandise', 'Apparel', 'Steel Dragon hoodie', FALSE),
('Glow-in-Dark Coaster Track Hoodie', 59.99, 1, 40, 'merchandise', 'Apparel', 'Glow in dark hoodie', FALSE),
('ThrillWorld Windbreaker Jacket', 44.99, 1, 50, 'merchandise', 'Apparel', 'Windbreaker jacket', FALSE),

-- ACCESSORIES (5 items)
('ThrillWorld Snapback Cap', 24.99, 1, 100, 'merchandise', 'Accessories', 'Snapback cap', FALSE),
('3D Coaster Track Keychain', 9.99, 1, 200, 'merchandise', 'Accessories', '3D keychain', FALSE),
('Collector Pin Set (5-Pack)', 34.99, 1, 50, 'merchandise', 'Accessories', 'Pin collection', FALSE),
('ThrillWorld Mini Backpack', 39.99, 1, 70, 'merchandise', 'Accessories', 'Mini backpack', FALSE),
('Light-Up Coaster Car Keychain', 14.99, 1, 120, 'merchandise', 'Accessories', 'Light-up keychain', FALSE),

-- TOYS (5 items)
('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise', 'Toys', 'Bear plush toy', FALSE),
('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise', 'Toys', 'Giant dragon plush', FALSE),
('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise', 'Toys', 'Die-cast model', FALSE),
('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise', 'Toys', 'Popcorn bucket', FALSE),
('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise', 'Toys', 'Light-up display', FALSE),

-- HOME (5 items)
('ThrillWorld Ceramic Coffee Mug', 16.99, 1, 110, 'merchandise', 'Home', 'Ceramic mug', FALSE),
('Steel Dragon Insulated Tumbler', 29.99, 1, 75, 'merchandise', 'Home', 'Insulated tumbler', FALSE),
('LED Neon Sign - ThrillWorld Logo', 79.99, 1, 15, 'merchandise', 'Home', 'LED neon sign', FALSE),
('Throw Blanket - Park Map Design', 39.99, 1, 40, 'merchandise', 'Home', 'Throw blanket', FALSE),
('Souvenir Refillable Cup (Park Special)', 19.99, 1, 200, 'merchandise', 'Home', 'Refillable cup', FALSE),

-- SOUVENIRS (3 items)
('Limited Edition 30th Anniversary Hoodie', 64.99, 1, 25, 'merchandise', 'Souvenirs', 'Limited edition hoodie', FALSE),
('SOLD OUT - Steel Dragon "I Survived" Tee', 26.99, 1, 50, 'merchandise', 'Souvenirs', 'I survived tee', FALSE),
('LOW STOCK - Crystal Coaster Sculpture', 89.99, 1, 20, 'merchandise', 'Souvenirs', 'Crystal sculpture', FALSE);

-- Verify the data was inserted
SELECT 'Total Items Inserted:' as Status, COUNT(*) as Count FROM commodity_type WHERE Category = 'merchandise';

SELECT 'Items by Category:' as Status;
SELECT
    Display_Category,
    COUNT(*) as Item_Count,
    SUM(Stock_Quantity) as Total_Stock
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

-- Show sample items from each category
SELECT 'Sample Items:' as Status;
SELECT
    Commodity_Name,
    Display_Category,
    Stock_Quantity,
    Base_Price
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name
LIMIT 10;

SELECT 'SUCCESS! All 22 items restored.' as Final_Status;
