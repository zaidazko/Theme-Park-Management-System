-- ========================================
-- Add required columns to commodity_type table
-- ========================================

USE theme_park;

-- Show current structure
DESCRIBE commodity_type;

-- Add Category column (for merchandise vs food)
ALTER TABLE commodity_type
ADD COLUMN Category VARCHAR(50) NOT NULL DEFAULT 'merchandise';

-- Add Display_Category column (for Apparel, Home, etc)
ALTER TABLE commodity_type
ADD COLUMN Display_Category VARCHAR(50) NOT NULL DEFAULT 'Uncategorized';

-- Add Commodity_Store column (store ID)
ALTER TABLE commodity_type
ADD COLUMN Commodity_Store INT NOT NULL DEFAULT 1;

-- Add Is_Discontinued column (flag for discontinued items)
ALTER TABLE commodity_type
ADD COLUMN Is_Discontinued BOOLEAN NOT NULL DEFAULT FALSE;

-- Show final structure
DESCRIBE commodity_type;

SELECT 'Columns added successfully!' as Status;
