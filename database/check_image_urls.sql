-- Check if image URLs are populated in the database
USE amusement_park_db;

SELECT
    'Current Image URL Status' AS status;

-- Check how many items have images vs. don't have images
SELECT
    COUNT(*) AS total_items,
    SUM(CASE WHEN Image_Url IS NOT NULL AND Image_Url != '' THEN 1 ELSE 0 END) AS items_with_images,
    SUM(CASE WHEN Image_Url IS NULL OR Image_Url = '' THEN 1 ELSE 0 END) AS items_without_images
FROM commodity_type
WHERE Category = 'merchandise';

-- Show all merchandise items and their image URLs
SELECT
    Commodity_TypeID,
    Commodity_Name,
    CASE
        WHEN Image_Url IS NULL THEN '❌ NULL'
        WHEN Image_Url = '' THEN '❌ EMPTY'
        ELSE CONCAT('✅ ', Image_Url)
    END AS Image_Status,
    Stock_Quantity
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID;
