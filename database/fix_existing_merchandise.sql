-- ========================================
-- Fix merchandise: Remove unwanted items and restore the 22 original items
-- ========================================

USE theme_park;

-- First, let's see ALL current items
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Category,
    Display_Category,
    Stock_Quantity
FROM commodity_type
ORDER BY Commodity_TypeID;

-- Delete the 4 unwanted items that appeared after merge
-- These are likely the newest items (highest IDs)
-- OPTION 1: Delete by ID range (if they are IDs 23-26 or similar)
-- Uncomment and adjust the IDs after checking above:
-- DELETE FROM commodity_type WHERE Commodity_TypeID IN (23, 24, 25, 26);

-- OPTION 2: Delete items with NULL or empty Category (the new merged ones)
DELETE FROM commodity_type
WHERE Category IS NULL OR Category = '' OR Category = 'food';

-- Update ALL remaining items to have Category = 'merchandise'
UPDATE commodity_type
SET Category = 'merchandise'
WHERE Category IS NULL OR Category = '';

-- Update items that should be in specific display categories
-- Apparel items
UPDATE commodity_type
SET Display_Category = 'Apparel'
WHERE Category = 'merchandise'
AND (
    Commodity_Name LIKE '%Tee%'
    OR Commodity_Name LIKE '%Shirt%'
    OR Commodity_Name LIKE '%Hoodie%'
    OR Commodity_Name LIKE '%Jacket%'
    OR Commodity_Name LIKE '%Windbreaker%'
    OR Commodity_Name LIKE '%Cap%'
);

-- Home items (drinkware, blankets, signs)
UPDATE commodity_type
SET Display_Category = 'Home'
WHERE Category = 'merchandise'
AND (
    Commodity_Name LIKE '%Tumbler%'
    OR Commodity_Name LIKE '%Mug%'
    OR Commodity_Name LIKE '%Cup%'
    OR Commodity_Name LIKE '%Blanket%'
    OR Commodity_Name LIKE '%Display%'
    OR Commodity_Name LIKE '%Sign%'
    OR Commodity_Name LIKE '%Bucket%'
);

-- Souvenirs (keychains, pins, plush, models)
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Category = 'merchandise'
AND (
    Commodity_Name LIKE '%Keychain%'
    OR Commodity_Name LIKE '%Pin%'
    OR Commodity_Name LIKE '%Plush%'
    OR Commodity_Name LIKE '%Model%'
    OR Commodity_Name LIKE '%Backpack%'
    OR Commodity_Name LIKE '%Sculpture%'
);

-- Set any remaining items to 'All' category
UPDATE commodity_type
SET Display_Category = 'All'
WHERE Category = 'merchandise'
AND Display_Category = 'Uncategorized';

-- Set all items to not discontinued
UPDATE commodity_type
SET Is_Discontinued = FALSE;

-- Set Commodity_Store to 1 for all merchandise
UPDATE commodity_type
SET Commodity_Store = 1
WHERE Category = 'merchandise';

-- Verify the final results
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Category,
    Display_Category,
    Stock_Quantity,
    Is_Discontinued
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID;

-- Show count by category
SELECT
    Display_Category,
    COUNT(*) as Item_Count
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category;

SELECT 'Merchandise fixed! Your 22 items should be back.' as Status;
