-- Add Description column to ride table if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'ride'
    AND COLUMN_NAME = 'Description'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE ride ADD COLUMN Description VARCHAR(500) NULL',
    'SELECT "Column already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert the three featured rides if they don't already exist
-- Using 'Operational' as the status (valid values are: 'Operational', 'Under Maintenance')

-- Insert Steel Dragon
INSERT INTO ride (Ride_Name, Capacity, Status, Image, Description)
SELECT 'Steel Dragon', 24, 'Operational', '/hypercoaster.jpg', 'Experience 120 mph of pure adrenaline on our newest hypercoaster! Steel Dragon features the tallest drop in the park at 420 feet and reaches mind-blowing speeds. This engineering marvel combines cutting-edge technology with heart-pounding thrills. Feel the rush as you soar through the sky on this record-breaking attraction.'
WHERE NOT EXISTS (SELECT 1 FROM ride WHERE Ride_Name = 'Steel Dragon');

-- Insert Twisted Cyclone
INSERT INTO ride (Ride_Name, Capacity, Status, Image, Description)
SELECT 'Twisted Cyclone', 32, 'Operational', '/TwistedCyclone.jpg', 'Death-defying loops and zero-gravity rolls! This hybrid wooden-steel coaster delivers non-stop intensity with its twisted track layout. Experience 8 inversions including a double barrel roll, a zero-g stall, and a cutback. Twisted Cyclone combines classic coaster nostalgia with modern thrills.'
WHERE NOT EXISTS (SELECT 1 FROM ride WHERE Ride_Name = 'Twisted Cyclone');

-- Insert Splash Mountain
INSERT INTO ride (Ride_Name, Capacity, Status, Image, Description)
SELECT 'Splash Mountain', 20, 'Operational', '/WaterRide.jpg', 'Beat the heat with our epic water ride adventure! This family-friendly log flume takes you on a journey through colorful scenes and animatronics before plunging down a 5-story drop. Get ready to make a splash and cool off in style! Perfect for hot summer days and fun for all ages.'
WHERE NOT EXISTS (SELECT 1 FROM ride WHERE Ride_Name = 'Splash Mountain');

-- Verify the rides were inserted
SELECT Ride_ID, Ride_Name, Capacity, Status, Image, Description
FROM ride
WHERE Ride_Name IN ('Steel Dragon', 'Twisted Cyclone', 'Splash Mountain')
ORDER BY Ride_Name;
