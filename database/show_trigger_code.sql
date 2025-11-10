-- ========================================
-- SHOW COMMODITY STOCK TRIGGER CODE AND VERIFY THEY'RE WORKING
-- ========================================

USE theme_park;

-- Show all trigger information
SELECT '==== TRIGGER INFORMATION ====' AS section;

SELECT
    TRIGGER_NAME,
    EVENT_MANIPULATION AS event_type,
    EVENT_OBJECT_TABLE AS table_name,
    ACTION_TIMING AS timing,
    ACTION_STATEMENT AS trigger_code
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
AND TRIGGER_NAME IN (
    'check_commodity_stock_before_purchase',
    'deduct_commodity_stock_after_purchase'
)
ORDER BY TRIGGER_NAME;

-- Show complete trigger definitions with formatting
SELECT '\n==== COMPLETE TRIGGER DEFINITIONS ====' AS section;

-- Get full trigger code from INFORMATION_SCHEMA
SELECT
    TRIGGER_NAME,
    CONCAT(
        'DELIMITER $$\n\n',
        'CREATE TRIGGER ', TRIGGER_NAME, '\n',
        ACTION_TIMING, ' ', EVENT_MANIPULATION, ' ON ', EVENT_OBJECT_TABLE, '\n',
        'FOR EACH ROW\n',
        ACTION_STATEMENT, '\n\n',
        'DELIMITER ;'
    ) AS trigger_definition
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
AND TRIGGER_NAME IN (
    'check_commodity_stock_before_purchase',
    'deduct_commodity_stock_after_purchase'
)
ORDER BY TRIGGER_NAME;

-- Quick functional test
SELECT '\n==== RUNNING QUICK FUNCTIONAL TEST ====' AS section;

START TRANSACTION;

-- Get a test commodity with sufficient stock
SET @test_id = (SELECT Commodity_TypeID FROM commodity_type WHERE Stock_Quantity >= 5 LIMIT 1);
SET @stock_before = (SELECT Stock_Quantity FROM commodity_type WHERE Commodity_TypeID = @test_id);

SELECT
    @test_id AS test_commodity_id,
    (SELECT Commodity_Name FROM commodity_type WHERE Commodity_TypeID = @test_id) AS commodity_name,
    @stock_before AS stock_before_purchase;

-- Simulate a purchase
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
VALUES (1, @test_id, 2, 50.00, 'credit', NOW());

SET @stock_after = (SELECT Stock_Quantity FROM commodity_type WHERE Commodity_TypeID = @test_id);

-- Show results
SELECT
    'TRIGGER TEST RESULT' AS test,
    @stock_before AS stock_before,
    @stock_after AS stock_after,
    @stock_before - @stock_after AS deducted,
    CASE
        WHEN @stock_before - @stock_after = 2
        THEN '✅ TRIGGERS WORKING - Stock correctly deducted by 2'
        ELSE '❌ TRIGGERS NOT WORKING - Stock not deducted correctly'
    END AS result;

-- Rollback test transaction
ROLLBACK;

SELECT '✅ Test complete - transaction rolled back, no data changed' AS final_status;
