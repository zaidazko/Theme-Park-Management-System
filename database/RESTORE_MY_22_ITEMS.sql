-- ========================================
-- RESTORE YOUR ORIGINAL 22 MERCHANDISE ITEMS
-- This will delete ALL current items and restore your original 22
-- ========================================

USE theme_park;

-- STEP 1: Delete sales records first (to avoid foreign key constraint)
DELETE FROM commodity_sale;

-- STEP 2: Delete ALL current commodity items
DELETE FROM commodity_type;

-- STEP 3: Insert your original 22 items with correct columns
-- ====================
-- APPAREL (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Is_Discontinued)
VALUES
('ThrillWorld Classic Logo Tee', 24.99, 1, 150, 'merchandise', 'Apparel', FALSE),
('Steel Dragon Pullover Hoodie', 49.99, 1, 60, 'merchandise', 'Apparel', FALSE),
('Glow-in-Dark Coaster Track Hoodie', 59.99, 1, 40, 'merchandise', 'Apparel', FALSE),
('ThrillWorld Windbreaker Jacket', 44.99, 1, 50, 'merchandise', 'Apparel', FALSE),
('Limited Edition 30th Anniversary Hoodie', 64.99, 1, 25, 'merchandise', 'Apparel', FALSE);

-- ====================
-- ACCESSORIES (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Is_Discontinued)
VALUES
('ThrillWorld Snapback Cap', 24.99, 1, 100, 'merchandise', 'Apparel', FALSE),
('3D Coaster Track Keychain', 9.99, 1, 200, 'merchandise', 'Souvenirs', FALSE),
('Collector Pin Set (5-Pack)', 34.99, 1, 50, 'merchandise', 'Souvenirs', FALSE),
('ThrillWorld Mini Backpack', 39.99, 1, 70, 'merchandise', 'Souvenirs', FALSE),
('Light-Up Coaster Car Keychain', 14.99, 1, 120, 'merchandise', 'Souvenirs', FALSE);

-- ====================
-- TOYS & COLLECTIBLES (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Is_Discontinued)
VALUES
('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise', 'Souvenirs', FALSE),
('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise', 'Souvenirs', FALSE),
('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise', 'Souvenirs', FALSE),
('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise', 'Home', FALSE),
('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise', 'Home', FALSE);

-- ====================
-- HOME & LIFESTYLE (5 items)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Is_Discontinued)
VALUES
('ThrillWorld Ceramic Coffee Mug', 16.99, 1, 110, 'merchandise', 'Home', FALSE),
('Steel Dragon Insulated Tumbler', 29.99, 1, 75, 'merchandise', 'Home', FALSE),
('LED Neon Sign - ThrillWorld Logo', 79.99, 1, 15, 'merchandise', 'Home', FALSE),
('Throw Blanket - Park Map Design', 39.99, 1, 40, 'merchandise', 'Home', FALSE),
('Souvenir Refillable Cup (Park Special)', 19.99, 1, 200, 'merchandise', 'Home', FALSE);

-- ====================
-- Test items (out of stock / low stock)
-- ====================
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Is_Discontinued)
VALUES
('SOLD OUT - Steel Dragon "I Survived" Tee', 26.99, 1, 0, 'merchandise', 'Apparel', FALSE),
('LOW STOCK - Crystal Coaster Sculpture', 89.99, 1, 3, 'merchandise', 'Souvenirs', FALSE);

-- Verify the restore
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Base_Price,
    Stock_Quantity,
    Category,
    Display_Category,
    Is_Discontinued
FROM commodity_type
ORDER BY Commodity_TypeID;

SELECT COUNT(*) as Total_Items FROM commodity_type;

SELECT 'Your 22 items have been restored!' as Status;
