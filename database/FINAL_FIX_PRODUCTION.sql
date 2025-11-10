-- ========================================
-- FINAL FIX: Complete production database fix
-- This handles ALL possible issues
-- ========================================

USE theme_park;

-- Step 1: Show what we have NOW (before fix)
SELECT 'BEFORE FIX - Current State:' as Status;
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise' OR Category IS NULL
ORDER BY Commodity_TypeID;

-- Step 2: Fix Category column (set to 'merchandise' for all items)
UPDATE commodity_type
SET Category = 'merchandise'
WHERE Category IS NULL OR Category = '';

-- Step 3: Fix Display_Category for each category (EXACT spelling matters!)

-- APPAREL (4 items)
UPDATE commodity_type
SET Display_Category = 'Apparel'
WHERE Commodity_Name IN (
    'ThrillWorld Classic Logo Tee',
    'Steel Dragon Pullover Hoodie',
    'Glow-in-Dark Coaster Track Hoodie',
    'ThrillWorld Windbreaker Jacket'
);

-- ACCESSORIES (5 items)
UPDATE commodity_type
SET Display_Category = 'Accessories'
WHERE Commodity_Name IN (
    'ThrillWorld Snapback Cap',
    '3D Coaster Track Keychain',
    'Collector Pin Set (5-Pack)',
    'ThrillWorld Mini Backpack',
    'Light-Up Coaster Car Keychain'
);

-- TOYS (5 items) - Insert if missing, update if exists
INSERT INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Description, Is_Discontinued)
VALUES
    ('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise', 'Toys', 'Bear plush toy', FALSE),
    ('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise', 'Toys', 'Giant dragon plush', FALSE),
    ('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise', 'Toys', 'Die-cast model', FALSE),
    ('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise', 'Toys', 'Popcorn bucket', FALSE),
    ('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise', 'Toys', 'Light-up display', FALSE)
ON DUPLICATE KEY UPDATE
    Display_Category = 'Toys',
    Stock_Quantity = VALUES(Stock_Quantity),
    Category = 'merchandise';

-- Update existing toys items if they exist
UPDATE commodity_type
SET Display_Category = 'Toys', Category = 'merchandise'
WHERE Commodity_Name IN (
    'Roller Coaster Bear Plush',
    'Giant ThrillWorld Dragon Plush',
    'Die-Cast Coaster Train Model',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
);

-- HOME (5 items)
UPDATE commodity_type
SET Display_Category = 'Home'
WHERE Commodity_Name IN (
    'ThrillWorld Ceramic Coffee Mug',
    'Steel Dragon Insulated Tumbler',
    'LED Neon Sign - ThrillWorld Logo',
    'Throw Blanket - Park Map Design',
    'Souvenir Refillable Cup (Park Special)'
);

-- SOUVENIRS (3 items)
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Commodity_Name IN (
    'Limited Edition 30th Anniversary Hoodie',
    'SOLD OUT - Steel Dragon "I Survived" Tee',
    'LOW STOCK - Crystal Coaster Sculpture'
);

-- Step 4: Ensure all items have proper stock (not 0)
UPDATE commodity_type SET Stock_Quantity = 150 WHERE Commodity_Name = 'ThrillWorld Classic Logo Tee';
UPDATE commodity_type SET Stock_Quantity = 60 WHERE Commodity_Name = 'Steel Dragon Pullover Hoodie';
UPDATE commodity_type SET Stock_Quantity = 40 WHERE Commodity_Name = 'Glow-in-Dark Coaster Track Hoodie';
UPDATE commodity_type SET Stock_Quantity = 50 WHERE Commodity_Name = 'ThrillWorld Windbreaker Jacket';
UPDATE commodity_type SET Stock_Quantity = 100 WHERE Commodity_Name = 'ThrillWorld Snapback Cap';
UPDATE commodity_type SET Stock_Quantity = 200 WHERE Commodity_Name = '3D Coaster Track Keychain';
UPDATE commodity_type SET Stock_Quantity = 50 WHERE Commodity_Name = 'Collector Pin Set (5-Pack)';
UPDATE commodity_type SET Stock_Quantity = 70 WHERE Commodity_Name = 'ThrillWorld Mini Backpack';
UPDATE commodity_type SET Stock_Quantity = 120 WHERE Commodity_Name = 'Light-Up Coaster Car Keychain';
UPDATE commodity_type SET Stock_Quantity = 110 WHERE Commodity_Name = 'ThrillWorld Ceramic Coffee Mug';
UPDATE commodity_type SET Stock_Quantity = 75 WHERE Commodity_Name = 'Steel Dragon Insulated Tumbler';
UPDATE commodity_type SET Stock_Quantity = 15 WHERE Commodity_Name = 'LED Neon Sign - ThrillWorld Logo';
UPDATE commodity_type SET Stock_Quantity = 40 WHERE Commodity_Name = 'Throw Blanket - Park Map Design';
UPDATE commodity_type SET Stock_Quantity = 200 WHERE Commodity_Name = 'Souvenir Refillable Cup (Park Special)';
UPDATE commodity_type SET Stock_Quantity = 25 WHERE Commodity_Name = 'Limited Edition 30th Anniversary Hoodie';
UPDATE commodity_type SET Stock_Quantity = 50 WHERE Commodity_Name = 'SOLD OUT - Steel Dragon "I Survived" Tee';
UPDATE commodity_type SET Stock_Quantity = 20 WHERE Commodity_Name = 'LOW STOCK - Crystal Coaster Sculpture';

-- Step 5: Show what we have AFTER fix
SELECT 'AFTER FIX - Items by Category:' as Status;
SELECT
    Display_Category,
    COUNT(*) as Item_Count,
    SUM(Stock_Quantity) as Total_Stock
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

SELECT 'AFTER FIX - All Items:' as Status;
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name;

SELECT 'SUCCESS! Check the results above. Should see: Accessories(5), Apparel(4), Home(5), Souvenirs(3), Toys(5)' as Final_Status;
