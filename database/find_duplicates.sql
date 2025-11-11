-- Find duplicate merchandise items
USE amusement_park_db;

-- Show duplicate items
SELECT
    Commodity_Name,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(Commodity_TypeID ORDER BY Commodity_TypeID) as all_ids
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Commodity_Name
HAVING COUNT(*) > 1
ORDER BY Commodity_Name;

-- Show detailed info for duplicates
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Base_Price,
    Stock_Quantity,
    Display_Category,
    Image_Url
FROM commodity_type
WHERE Commodity_Name IN (
    'Die-Cast Coaster Train Model',
    'Giant ThrillWorld Dragon Plush',
    'Roller Coaster Bear Plush',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
)
ORDER BY Commodity_Name, Commodity_TypeID;
