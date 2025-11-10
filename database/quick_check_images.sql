-- Quick check: Are image URLs in the database?
USE amusement_park_db;

SELECT
    Commodity_Name,
    Image_Url,
    CASE
        WHEN Image_Url IS NULL THEN '❌ NULL - Images will NOT show'
        WHEN Image_Url = '' THEN '❌ EMPTY - Images will NOT show'
        ELSE '✅ SET - Images should show'
    END AS Status
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID
LIMIT 10;
