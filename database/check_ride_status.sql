-- Check the structure of the ride table
DESCRIBE ride;

-- Check existing status values
SELECT DISTINCT Status FROM ride WHERE Status IS NOT NULL;
