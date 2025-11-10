-- ========================================
-- Verify production database has correct data
-- ========================================

USE theme_park;

-- Check total merchandise items
SELECT 'Total Merchandise Items:' as Check_Name, COUNT(*) as Count
FROM commodity_type
WHERE Category = 'merchandise';

-- Check items by Display_Category
SELECT 'Items by Category:' as Report;
SELECT
    Display_Category,
    COUNT(*) as Item_Count
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

-- Check for NULL or empty Display_Category values
SELECT 'Items with NULL/Empty Display_Category:' as Report;
SELECT
    Commodity_Name,
    Display_Category,
    CHAR_LENGTH(Display_Category) as Length,
    ASCII(SUBSTRING(Display_Category, 1, 1)) as FirstCharASCII
FROM commodity_type
WHERE Category = 'merchandise' AND (Display_Category IS NULL OR Display_Category = '');

-- Show ALL items with their exact Display_Category values
SELECT 'All Items with Display_Category:' as Report;
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Display_Category,
    CONCAT('[', Display_Category, ']') as Display_Category_With_Brackets,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name;
