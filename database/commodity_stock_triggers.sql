-- ========================================
-- COMMODITY STOCK MANAGEMENT TRIGGERS
-- ========================================
-- These triggers automatically manage inventory when purchases are made
-- Trigger 1: Validates stock availability BEFORE purchase
-- Trigger 2: Deducts stock quantity AFTER successful purchase
-- ========================================

USE theme_park;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_commodity_stock_before_purchase;
DROP TRIGGER IF EXISTS deduct_commodity_stock_after_purchase;
-- ========================================
-- TRIGGER 1: CHECK STOCK BEFORE PURCHASE
-- ========================================
-- This trigger fires BEFORE INSERT on commodity_sale
-- It validates that:
--   1. Quantity is greater than 0
--   2. Sufficient stock is available
-- If validation fails, it raises an error and prevents the purchase

DELIMITER $$

CREATE TRIGGER check_commodity_stock_before_purchase
BEFORE INSERT ON commodity_sale
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    DECLARE commodity_name VARCHAR(255);

    -- Check if quantity is valid (must be > 0)
    IF NEW.Quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Purchase quantity must be greater than 0';
    END IF;

    -- Get current stock and commodity name
    SELECT Stock_Quantity, Commodity_Name
    INTO available_stock, commodity_name
    FROM commodity_type
    WHERE Commodity_TypeID = NEW.Commodity_TypeID;

    -- Check if commodity exists
    IF available_stock IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Commodity not found';
    END IF;

    -- Check if sufficient stock is available
    IF available_stock < NEW.Quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Insufficient stock for ', commodity_name,
                                 '. Available: ', available_stock,
                                 ', Requested: ', NEW.Quantity);
    END IF;
END$$

DELIMITER ;

-- ========================================
-- TRIGGER 2: DEDUCT STOCK AFTER PURCHASE
-- ========================================
-- This trigger fires AFTER INSERT on commodity_sale
-- It automatically deducts the purchased quantity from inventory

DELIMITER $$

CREATE TRIGGER deduct_commodity_stock_after_purchase
AFTER INSERT ON commodity_sale
FOR EACH ROW
BEGIN
    -- Deduct the purchased quantity from stock
    UPDATE commodity_type
    SET Stock_Quantity = Stock_Quantity - NEW.Quantity
    WHERE Commodity_TypeID = NEW.Commodity_TypeID;
END$$

DELIMITER ;

-- ========================================
-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'Triggers created successfully!' AS status;

-- Show trigger information
SELECT
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    CREATED
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
AND TRIGGER_NAME IN (
    'check_commodity_stock_before_purchase',
    'deduct_commodity_stock_after_purchase'
)
ORDER BY TRIGGER_NAME;
