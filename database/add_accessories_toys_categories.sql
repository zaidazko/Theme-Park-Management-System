-- ========================================
-- Add Accessories and Toys categories
-- Recategorize items properly
-- ========================================

USE theme_park;

-- Update items to Accessories category
UPDATE commodity_type
SET Display_Category = 'Accessories'
WHERE Commodity_Name IN (
    'ThrillWorld Snapback Cap',
    '3D Coaster Track Keychain',
    'Collector Pin Set (5-Pack)',
    'ThrillWorld Mini Backpack',
    'Light-Up Coaster Car Keychain'
);

-- Update items to Toys category
UPDATE commodity_type
SET Display_Category = 'Toys'
WHERE Commodity_Name IN (
    'Roller Coaster Bear Plush',
    'Giant ThrillWorld Dragon Plush',
    'Die-Cast Coaster Train Model',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
);

-- Keep these in Souvenirs
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Commodity_Name IN (
    'Limited Edition 30th Anniversary Hoodie',
    'SOLD OUT - Steel Dragon "I Survived" Tee',
    'LOW STOCK - Crystal Coaster Sculpture'
);

-- Verify the changes
SELECT
    Display_Category,
    COUNT(*) as Items
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

-- Show all items by category
SELECT
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name;

SELECT 'Categories updated! Accessories and Toys added.' as Status;
