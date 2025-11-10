-- Comprehensive test script for commodity stock triggers
-- This script tests various scenarios to ensure triggers work correctly

-- Start transaction to test without permanently affecting data
START TRANSACTION;

-- ====================
-- TEST 1: Normal Purchase (Should succeed and deduct stock)
-- ====================
SELECT '==== TEST 1: Normal Purchase ====' AS test;

-- Get a commodity with sufficient stock
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Stock_Quantity AS stock_before
FROM commodity_type
WHERE Stock_Quantity >= 5
LIMIT 1;

-- Store the commodity ID for testing
SET @test_commodity_id = (
    SELECT Commodity_TypeID
    FROM commodity_type
    WHERE Stock_Quantity >= 5
    LIMIT 1
);

SET @stock_before_test1 = (
    SELECT Stock_Quantity
    FROM commodity_type
    WHERE Commodity_TypeID = @test_commodity_id
);

-- Attempt to purchase 2 items
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
VALUES (1, @test_commodity_id, 2, 50.00, 'credit', NOW());

SET @stock_after_test1 = (
    SELECT Stock_Quantity
    FROM commodity_type
    WHERE Commodity_TypeID = @test_commodity_id
);

SELECT
    'TEST 1 RESULT' AS test,
    @stock_before_test1 AS stock_before,
    @stock_after_test1 AS stock_after,
    @stock_before_test1 - @stock_after_test1 AS quantity_deducted,
    CASE
        WHEN @stock_before_test1 - @stock_after_test1 = 2
        THEN '✅ PASS - Stock correctly deducted'
        ELSE '❌ FAIL - Stock not deducted correctly'
    END AS result;

-- ====================
-- TEST 2: Attempt to purchase more than available (Should fail)
-- ====================
SELECT '==== TEST 2: Insufficient Stock Purchase ====' AS test;

-- Get a commodity with low stock
SET @low_stock_commodity = (
    SELECT Commodity_TypeID
    FROM commodity_type
    WHERE Stock_Quantity > 0 AND Stock_Quantity < 5
    LIMIT 1
);

SET @low_stock_amount = (
    SELECT Stock_Quantity
    FROM commodity_type
    WHERE Commodity_TypeID = @low_stock_commodity
);

SELECT
    'Attempting to buy more than available' AS action,
    @low_stock_commodity AS commodity_id,
    @low_stock_amount AS available_stock,
    @low_stock_amount + 10 AS attempted_quantity;

-- This should fail with trigger error
-- Uncomment to test (will cause error):
-- INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
-- VALUES (1, @low_stock_commodity, @low_stock_amount + 10, 100.00, 'credit', NOW());

SELECT '✅ TEST 2 SETUP COMPLETE - Uncomment INSERT to test insufficient stock error' AS result;

-- ====================
-- TEST 3: Attempt to purchase out-of-stock item (Should fail)
-- ====================
SELECT '==== TEST 3: Out of Stock Purchase ====' AS test;

-- Get a commodity with 0 stock (or temporarily set one to 0)
SET @zero_stock_commodity = (
    SELECT Commodity_TypeID
    FROM commodity_type
    WHERE Stock_Quantity = 0
    LIMIT 1
);

SELECT
    'Attempting to buy out-of-stock item' AS action,
    @zero_stock_commodity AS commodity_id,
    0 AS available_stock;

-- This should fail with trigger error
-- Uncomment to test (will cause error):
-- INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
-- VALUES (1, @zero_stock_commodity, 1, 10.00, 'credit', NOW());

SELECT '✅ TEST 3 SETUP COMPLETE - Uncomment INSERT to test out-of-stock error' AS result;

-- ====================
-- TEST 4: Attempt to purchase with quantity <= 0 (Should fail)
-- ====================
SELECT '==== TEST 4: Invalid Quantity ====' AS test;

SET @any_commodity = (SELECT Commodity_TypeID FROM commodity_type LIMIT 1);

-- This should fail with trigger error
-- Uncomment to test (will cause error):
-- INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
-- VALUES (1, @any_commodity, 0, 0.00, 'credit', NOW());

SELECT '✅ TEST 4 SETUP COMPLETE - Uncomment INSERT to test invalid quantity error' AS result;

-- ====================
-- TEST 5: Multiple Purchases in Sequence
-- ====================
SELECT '==== TEST 5: Sequential Purchases ====' AS test;

SET @seq_commodity = (
    SELECT Commodity_TypeID
    FROM commodity_type
    WHERE Stock_Quantity >= 10
    LIMIT 1
);

SET @stock_before_seq = (
    SELECT Stock_Quantity
    FROM commodity_type
    WHERE Commodity_TypeID = @seq_commodity
);

-- Purchase 1
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
VALUES (1, @seq_commodity, 2, 20.00, 'credit', NOW());

-- Purchase 2
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Price, Payment_Method, Purchase_Date)
VALUES (2, @seq_commodity, 3, 30.00, 'debit', NOW());

SET @stock_after_seq = (
    SELECT Stock_Quantity
    FROM commodity_type
    WHERE Commodity_TypeID = @seq_commodity
);

SELECT
    'TEST 5 RESULT' AS test,
    @stock_before_seq AS stock_before,
    @stock_after_seq AS stock_after,
    @stock_before_seq - @stock_after_seq AS total_deducted,
    CASE
        WHEN @stock_before_seq - @stock_after_seq = 5
        THEN '✅ PASS - Multiple purchases correctly deducted'
        ELSE '❌ FAIL - Sequential purchases not working'
    END AS result;

-- ====================
-- Summary
-- ====================
SELECT '==== TEST SUMMARY ====' AS summary;

SELECT
    'Tests completed in transaction (no data permanently changed)' AS note,
    'Run COMMIT to save test data, or ROLLBACK to discard' AS action;

-- Rollback to undo all test changes
ROLLBACK;

SELECT '✅ All test data rolled back - database unchanged' AS final_status;
