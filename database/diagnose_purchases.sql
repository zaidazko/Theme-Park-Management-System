-- Diagnostic script to check if purchases are being saved

-- 1. Check if commodity_sale table exists and has data
SELECT 'commodity_sale table status' AS check_type;
SELECT
    COUNT(*) AS total_sales,
    MAX(Purchase_Date) AS most_recent_purchase,
    MIN(Purchase_Date) AS oldest_purchase
FROM commodity_sale;

-- 2. Show the 10 most recent purchases
SELECT '10 Most Recent Purchases' AS check_type;
SELECT
    cs.Commodity_SaleID,
    cs.Customer_ID,
    ct.Commodity_Name,
    cs.Quantity,
    cs.Price,
    cs.Payment_Method,
    cs.Purchase_Date
FROM commodity_sale cs
LEFT JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
ORDER BY cs.Purchase_Date DESC
LIMIT 10;

-- 3. Check commodity stock levels
SELECT 'Current Stock Levels' AS check_type;
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Stock_Quantity,
    Base_Price,
    Category,
    Display_Category
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Stock_Quantity ASC
LIMIT 10;

-- 4. Check if triggers exist
SELECT 'Trigger Status' AS check_type;
SELECT
    TRIGGER_NAME,
    EVENT_MANIPULATION AS trigger_type,
    ACTION_TIMING AS timing,
    EVENT_OBJECT_TABLE AS table_name
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
AND EVENT_OBJECT_TABLE IN ('commodity_sale', 'commodity_type')
ORDER BY TRIGGER_NAME;

-- 5. Check for any purchase made in the last hour
SELECT 'Purchases in Last Hour' AS check_type;
SELECT
    cs.Commodity_SaleID,
    cs.Customer_ID,
    ct.Commodity_Name,
    cs.Quantity,
    cs.Price,
    cs.Purchase_Date,
    TIMESTAMPDIFF(MINUTE, cs.Purchase_Date, NOW()) AS minutes_ago
FROM commodity_sale cs
LEFT JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
WHERE cs.Purchase_Date >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY cs.Purchase_Date DESC;

-- 6. Check for any failed transactions (if you have a log table)
SELECT 'Recent Activity Summary' AS check_type;
SELECT
    DATE(Purchase_Date) AS purchase_date,
    COUNT(*) AS number_of_purchases,
    SUM(Price) AS total_revenue,
    SUM(Quantity) AS total_items_sold
FROM commodity_sale
WHERE Purchase_Date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(Purchase_Date)
ORDER BY DATE(Purchase_Date) DESC;

-- 7. Check database name to ensure you're looking at the correct database
SELECT 'Current Database Info' AS check_type;
SELECT
    DATABASE() AS current_database,
    USER() AS current_user,
    NOW() AS current_timestamp;
