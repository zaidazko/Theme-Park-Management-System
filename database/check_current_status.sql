-- ========================================
-- Check current database status
-- ========================================

USE theme_park;

-- Show ALL items currently in database
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Stock_Quantity,
    Display_Category,
    Category
FROM commodity_type
ORDER BY Commodity_TypeID;

-- Count by category
SELECT
    Display_Category,
    COUNT(*) as Items,
    SUM(Stock_Quantity) as Total_Stock
FROM commodity_type
GROUP BY Display_Category
ORDER BY Display_Category;

-- Check the 3 specific items
SELECT
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Commodity_Name IN (
    'Limited Edition 30th Anniversary Hoodie',
    'Steel Dragon Insulated Tumbler',
    'SOLD OUT - Steel Dragon "I Survived" Tee'
);

-- Total count
SELECT COUNT(*) as Total_Items FROM commodity_type;
