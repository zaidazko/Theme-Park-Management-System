-- Fix duplicate merchandise items by migrating sales and removing duplicates
USE amusement_park_db;

SET SQL_SAFE_UPDATES = 0;

-- Step 1: Show the duplicates and their sales
SELECT
    'DUPLICATE ITEMS WITH SALES' AS info,
    ct.Commodity_TypeID,
    ct.Commodity_Name,
    ct.Stock_Quantity,
    COUNT(cs.Commodity_SaleID) as sales_count
FROM commodity_type ct
LEFT JOIN commodity_sale cs ON ct.Commodity_TypeID = cs.Commodity_TypeID
WHERE ct.Commodity_Name IN (
    'Die-Cast Coaster Train Model',
    'Giant ThrillWorld Dragon Plush',
    'Roller Coaster Bear Plush',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
)
AND ct.Category = 'merchandise'
GROUP BY ct.Commodity_TypeID, ct.Commodity_Name, ct.Stock_Quantity
ORDER BY ct.Commodity_Name, ct.Commodity_TypeID;

-- Step 2: For each duplicate, migrate sales to the original (lowest ID) item

-- Die-Cast Coaster Train Model
UPDATE commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
SET cs.Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Die-Cast Coaster Train Model'
    AND Category = 'merchandise'
)
WHERE ct.Commodity_Name = 'Die-Cast Coaster Train Model'
AND ct.Category = 'merchandise'
AND cs.Commodity_TypeID != (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Die-Cast Coaster Train Model'
    AND Category = 'merchandise'
);

-- Giant ThrillWorld Dragon Plush
UPDATE commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
SET cs.Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Giant ThrillWorld Dragon Plush'
    AND Category = 'merchandise'
)
WHERE ct.Commodity_Name = 'Giant ThrillWorld Dragon Plush'
AND ct.Category = 'merchandise'
AND cs.Commodity_TypeID != (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Giant ThrillWorld Dragon Plush'
    AND Category = 'merchandise'
);

-- Roller Coaster Bear Plush
UPDATE commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
SET cs.Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Roller Coaster Bear Plush'
    AND Category = 'merchandise'
)
WHERE ct.Commodity_Name = 'Roller Coaster Bear Plush'
AND ct.Category = 'merchandise'
AND cs.Commodity_TypeID != (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Roller Coaster Bear Plush'
    AND Category = 'merchandise'
);

-- Souvenir Popcorn Bucket - Dragon
UPDATE commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
SET cs.Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
    AND Category = 'merchandise'
)
WHERE ct.Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
AND ct.Category = 'merchandise'
AND cs.Commodity_TypeID != (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
    AND Category = 'merchandise'
);

-- Light-Up Coaster Track Display
UPDATE commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
SET cs.Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Light-Up Coaster Track Display'
    AND Category = 'merchandise'
)
WHERE ct.Commodity_Name = 'Light-Up Coaster Track Display'
AND ct.Category = 'merchandise'
AND cs.Commodity_TypeID != (
    SELECT MIN(Commodity_TypeID)
    FROM commodity_type
    WHERE Commodity_Name = 'Light-Up Coaster Track Display'
    AND Category = 'merchandise'
);

-- Step 3: Merge stock quantities - add duplicate stock to the original item
-- Do this for each item individually to avoid the "can't update table being selected" error

-- Die-Cast Coaster Train Model
UPDATE commodity_type
SET Stock_Quantity = Stock_Quantity + (
    SELECT COALESCE(SUM(Stock_Quantity), 0)
    FROM (SELECT * FROM commodity_type) AS ct2
    WHERE ct2.Commodity_Name = 'Die-Cast Coaster Train Model'
    AND ct2.Category = 'merchandise'
    AND ct2.Commodity_TypeID != (
        SELECT MIN(Commodity_TypeID)
        FROM (SELECT * FROM commodity_type) AS ct3
        WHERE ct3.Commodity_Name = 'Die-Cast Coaster Train Model'
        AND ct3.Category = 'merchandise'
    )
)
WHERE Commodity_Name = 'Die-Cast Coaster Train Model'
AND Category = 'merchandise'
AND Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM (SELECT * FROM commodity_type) AS ct4
    WHERE ct4.Commodity_Name = 'Die-Cast Coaster Train Model'
    AND ct4.Category = 'merchandise'
);

-- Giant ThrillWorld Dragon Plush
UPDATE commodity_type
SET Stock_Quantity = Stock_Quantity + (
    SELECT COALESCE(SUM(Stock_Quantity), 0)
    FROM (SELECT * FROM commodity_type) AS ct2
    WHERE ct2.Commodity_Name = 'Giant ThrillWorld Dragon Plush'
    AND ct2.Category = 'merchandise'
    AND ct2.Commodity_TypeID != (
        SELECT MIN(Commodity_TypeID)
        FROM (SELECT * FROM commodity_type) AS ct3
        WHERE ct3.Commodity_Name = 'Giant ThrillWorld Dragon Plush'
        AND ct3.Category = 'merchandise'
    )
)
WHERE Commodity_Name = 'Giant ThrillWorld Dragon Plush'
AND Category = 'merchandise'
AND Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM (SELECT * FROM commodity_type) AS ct4
    WHERE ct4.Commodity_Name = 'Giant ThrillWorld Dragon Plush'
    AND ct4.Category = 'merchandise'
);

-- Roller Coaster Bear Plush
UPDATE commodity_type
SET Stock_Quantity = Stock_Quantity + (
    SELECT COALESCE(SUM(Stock_Quantity), 0)
    FROM (SELECT * FROM commodity_type) AS ct2
    WHERE ct2.Commodity_Name = 'Roller Coaster Bear Plush'
    AND ct2.Category = 'merchandise'
    AND ct2.Commodity_TypeID != (
        SELECT MIN(Commodity_TypeID)
        FROM (SELECT * FROM commodity_type) AS ct3
        WHERE ct3.Commodity_Name = 'Roller Coaster Bear Plush'
        AND ct3.Category = 'merchandise'
    )
)
WHERE Commodity_Name = 'Roller Coaster Bear Plush'
AND Category = 'merchandise'
AND Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM (SELECT * FROM commodity_type) AS ct4
    WHERE ct4.Commodity_Name = 'Roller Coaster Bear Plush'
    AND ct4.Category = 'merchandise'
);

-- Souvenir Popcorn Bucket - Dragon
UPDATE commodity_type
SET Stock_Quantity = Stock_Quantity + (
    SELECT COALESCE(SUM(Stock_Quantity), 0)
    FROM (SELECT * FROM commodity_type) AS ct2
    WHERE ct2.Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
    AND ct2.Category = 'merchandise'
    AND ct2.Commodity_TypeID != (
        SELECT MIN(Commodity_TypeID)
        FROM (SELECT * FROM commodity_type) AS ct3
        WHERE ct3.Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
        AND ct3.Category = 'merchandise'
    )
)
WHERE Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
AND Category = 'merchandise'
AND Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM (SELECT * FROM commodity_type) AS ct4
    WHERE ct4.Commodity_Name = 'Souvenir Popcorn Bucket - Dragon'
    AND ct4.Category = 'merchandise'
);

-- Light-Up Coaster Track Display
UPDATE commodity_type
SET Stock_Quantity = Stock_Quantity + (
    SELECT COALESCE(SUM(Stock_Quantity), 0)
    FROM (SELECT * FROM commodity_type) AS ct2
    WHERE ct2.Commodity_Name = 'Light-Up Coaster Track Display'
    AND ct2.Category = 'merchandise'
    AND ct2.Commodity_TypeID != (
        SELECT MIN(Commodity_TypeID)
        FROM (SELECT * FROM commodity_type) AS ct3
        WHERE ct3.Commodity_Name = 'Light-Up Coaster Track Display'
        AND ct3.Category = 'merchandise'
    )
)
WHERE Commodity_Name = 'Light-Up Coaster Track Display'
AND Category = 'merchandise'
AND Commodity_TypeID = (
    SELECT MIN(Commodity_TypeID)
    FROM (SELECT * FROM commodity_type) AS ct4
    WHERE ct4.Commodity_Name = 'Light-Up Coaster Track Display'
    AND ct4.Category = 'merchandise'
);

-- Step 4: Now delete the duplicate items (sales have been migrated)
DELETE FROM commodity_type
WHERE Commodity_TypeID NOT IN (
    SELECT * FROM (
        SELECT MIN(Commodity_TypeID)
        FROM commodity_type
        WHERE Category = 'merchandise'
        GROUP BY Commodity_Name
    ) AS min_ids
)
AND Category = 'merchandise'
AND Commodity_Name IN (
    'Die-Cast Coaster Train Model',
    'Giant ThrillWorld Dragon Plush',
    'Roller Coaster Bear Plush',
    'Souvenir Popcorn Bucket - Dragon',
    'Light-Up Coaster Track Display'
);

SET SQL_SAFE_UPDATES = 1;

-- Verification
SELECT 'VERIFICATION - No duplicates should remain' AS status;

SELECT
    Commodity_Name,
    COUNT(*) as count
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Commodity_Name
HAVING COUNT(*) > 1;

SELECT
    'Total merchandise items' AS info,
    COUNT(*) as total
FROM commodity_type
WHERE Category = 'merchandise';
