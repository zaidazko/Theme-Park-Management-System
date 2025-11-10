-- ========================================
-- Add missing columns one at a time
-- Run each ALTER statement separately
-- Skip any that give "Duplicate column" errors
-- ========================================

USE theme_park;

-- 1. Try adding Display_Category
ALTER TABLE commodity_type
ADD COLUMN Display_Category VARCHAR(50) NOT NULL DEFAULT 'Uncategorized';

-- 2. Try adding Commodity_Store
ALTER TABLE commodity_type
ADD COLUMN Commodity_Store INT NOT NULL DEFAULT 1;

-- 3. Try adding Is_Discontinued
ALTER TABLE commodity_type
ADD COLUMN Is_Discontinued BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify final structure
DESCRIBE commodity_type;
