-- Verify that commodity stock triggers exist and are properly configured

-- 1. Check if triggers exist
SELECT
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    ACTION_STATEMENT
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
AND TRIGGER_NAME IN (
    'check_commodity_stock_before_purchase',
    'deduct_commodity_stock_after_purchase'
)
ORDER BY TRIGGER_NAME;

-- 2. Show trigger definitions
SHOW TRIGGERS WHERE `Trigger` LIKE '%commodity%';

-- 3. Verify commodity_sale and commodity_type tables exist
SELECT
    'commodity_sale table exists' AS status,
    COUNT(*) AS record_count
FROM commodity_sale
UNION ALL
SELECT
    'commodity_type table exists' AS status,
    COUNT(*) AS record_count
FROM commodity_type;

-- 4. Show sample commodity stock levels
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Stock_Quantity,
    Base_Price,
    Display_Category
FROM commodity_type
ORDER BY Stock_Quantity ASC
LIMIT 10;

-- 5. Show recent commodity sales
SELECT
    cs.Commodity_SaleID,
    cs.Customer_ID,
    ct.Commodity_Name,
    cs.Quantity,
    cs.Total_Price,
    cs.Purchase_Date
FROM commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
ORDER BY cs.Purchase_Date DESC
LIMIT 10;
