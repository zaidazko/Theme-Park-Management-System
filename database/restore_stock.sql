-- ========================================
-- Restore stock for all merchandise items
-- ========================================

USE theme_park;

-- Update all merchandise items to have stock
UPDATE commodity_type
SET Stock_Quantity = CASE Commodity_Name
    -- Apparel
    WHEN 'ThrillWorld Classic Logo Tee' THEN 150
    WHEN 'Steel Dragon Pullover Hoodie' THEN 60
    WHEN 'Glow-in-Dark Coaster Track Hoodie' THEN 40
    WHEN 'ThrillWorld Windbreaker Jacket' THEN 50
    WHEN 'Limited Edition 30th Anniversary Hoodie' THEN 25

    -- Accessories
    WHEN 'ThrillWorld Snapback Cap' THEN 100
    WHEN '3D Coaster Track Keychain' THEN 200
    WHEN 'Collector Pin Set (5-Pack)' THEN 50
    WHEN 'ThrillWorld Mini Backpack' THEN 70
    WHEN 'Light-Up Coaster Car Keychain' THEN 120

    -- Toys & Collectibles
    WHEN 'Roller Coaster Bear Plush' THEN 90
    WHEN 'Giant ThrillWorld Dragon Plush' THEN 40
    WHEN 'Die-Cast Coaster Train Model' THEN 55
    WHEN 'Souvenir Popcorn Bucket - Dragon' THEN 100
    WHEN 'Light-Up Coaster Track Display' THEN 20

    -- Home & Lifestyle
    WHEN 'ThrillWorld Ceramic Coffee Mug' THEN 110
    WHEN 'Steel Dragon Insulated Tumbler' THEN 75
    WHEN 'LED Neon Sign - ThrillWorld Logo' THEN 15
    WHEN 'Throw Blanket - Park Map Design' THEN 40
    WHEN 'Souvenir Refillable Cup (Park Special)' THEN 200

    -- Test items - now with stock!
    WHEN 'SOLD OUT - Steel Dragon "I Survived" Tee' THEN 50
    WHEN 'LOW STOCK - Crystal Coaster Sculpture' THEN 20

    ELSE Stock_Quantity
END
WHERE Category = 'merchandise';

-- Verify the update
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Stock_Quantity,
    Display_Category
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Display_Category, Commodity_Name;

-- Show summary
SELECT
    Display_Category,
    COUNT(*) as Items,
    SUM(Stock_Quantity) as Total_Stock
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

SELECT 'All merchandise stock restored!' as Status;
