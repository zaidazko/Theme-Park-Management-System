-- Verify that the image URLs were actually updated
USE amusement_park_db;

-- Show current state of Image_Url for all merchandise
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Image_Url,
    CASE
        WHEN Image_Url IS NULL OR Image_Url = '' THEN '❌ NO IMAGE'
        ELSE '✅ HAS IMAGE'
    END AS Status
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID;

-- Count summary
SELECT
    COUNT(*) AS total_merchandise,
    SUM(CASE WHEN Image_Url IS NOT NULL AND Image_Url != '' THEN 1 ELSE 0 END) AS with_images,
    SUM(CASE WHEN Image_Url IS NULL OR Image_Url = '' THEN 1 ELSE 0 END) AS without_images
FROM commodity_type
WHERE Category = 'merchandise';
