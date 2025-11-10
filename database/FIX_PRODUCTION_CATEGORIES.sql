-- ========================================
-- FIX PRODUCTION: Update existing items to correct categories
-- Run this on your PRODUCTION database
-- ========================================

USE theme_park;

-- Update items to correct Display_Category
-- APPAREL (should have 4 items)
UPDATE commodity_type
SET Display_Category = 'Apparel'
WHERE Commodity_Name IN (
    'ThrillWorld Classic Logo Tee',
    'Steel Dragon Pullover Hoodie',
    'Glow-in-Dark Coaster Track Hoodie',
    'ThrillWorld Windbreaker Jacket'
);

-- ACCESSORIES (should have 5 items)
UPDATE commodity_type
SET Display_Category = 'Accessories'
WHERE Commodity_Name IN (
    'ThrillWorld Snapback Cap',
    '3D Coaster Track Keychain',
    'Collector Pin Set (5-Pack)',
    'ThrillWorld Mini Backpack',
    'Light-Up Coaster Car Keychain'
);

-- TOYS (should have 5 items) - ADD THESE IF MISSING
-- First check if they exist, if not, insert them
INSERT IGNORE INTO commodity_type (Commodity_Name, Base_Price, Commodity_Store, Stock_Quantity, Category, Display_Category, Description, Is_Discontinued)
VALUES
('Roller Coaster Bear Plush', 24.99, 1, 90, 'merchandise', 'Toys', 'Bear plush toy', FALSE),
('Giant ThrillWorld Dragon Plush', 44.99, 1, 40, 'merchandise', 'Toys', 'Giant dragon plush', FALSE),
('Die-Cast Coaster Train Model', 34.99, 1, 55, 'merchandise', 'Toys', 'Die-cast model', FALSE),
('Souvenir Popcorn Bucket - Dragon', 19.99, 1, 100, 'merchandise', 'Toys', 'Popcorn bucket', FALSE),
('Light-Up Coaster Track Display', 64.99, 1, 20, 'merchandise', 'Toys', 'Light-up display', FALSE);

-- Update existing items that should be Toys
UPDATE commodity_type
SET Display_Category = 'Toys'
WHERE Commodity_Name IN (
    'Roller Coaster Bear Plush',
    'Giant ThrillWorld Dragon Plush',
    'Die-Cast Coaster Train Model',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
);

-- HOME (should have 5 items)
UPDATE commodity_type
SET Display_Category = 'Home'
WHERE Commodity_Name IN (
    'ThrillWorld Ceramic Coffee Mug',
    'Steel Dragon Insulated Tumbler',
    'LED Neon Sign - ThrillWorld Logo',
    'Throw Blanket - Park Map Design',
    'Souvenir Refillable Cup (Park Special)'
);

-- SOUVENIRS (should have 3 items)
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Commodity_Name IN (
    'Limited Edition 30th Anniversary Hoodie',
    'SOLD OUT - Steel Dragon "I Survived" Tee',
    'LOW STOCK - Crystal Coaster Sculpture'
);

-- Verify the fix
SELECT 'Items by Category:' as Report;
SELECT
    Display_Category,
    COUNT(*) as Item_Count
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

SELECT 'Should show: Accessories=5, Apparel=4, Home=5, Souvenirs=3, Toys=5, Total=22' as Expected;

SELECT 'All Items:' as Report;
SELECT
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name;

SELECT 'DONE! Categories fixed.' as Status;
