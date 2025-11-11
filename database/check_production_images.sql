-- Check if production database has image URLs
USE amusement_park_db;

-- Quick check
SELECT
    COUNT(*) as total_merchandise,
    SUM(CASE WHEN Image_Url IS NOT NULL AND Image_Url != '' THEN 1 ELSE 0 END) as with_images,
    SUM(CASE WHEN Image_Url IS NULL OR Image_Url = '' THEN 1 ELSE 0 END) as without_images
FROM commodity_type
WHERE Category = 'merchandise';

-- Show first 5 items
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Image_Url,
    CASE
        WHEN Image_Url IS NULL THEN '❌ NULL'
        WHEN Image_Url = '' THEN '❌ EMPTY'
        ELSE '✅ HAS IMAGE'
    END AS Status
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID
LIMIT 10;
