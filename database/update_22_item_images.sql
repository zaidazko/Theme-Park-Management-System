-- ========================================
-- UPDATE IMAGE URLs FOR YOUR 22 MERCHANDISE ITEMS
-- Maps database items to their corresponding image files
-- ========================================

USE amusement_park_db;

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- APPAREL (5 items)
UPDATE commodity_type
SET Image_Url = '/merchandise/thrillworld-classic-logo-tee.jpg'
WHERE Commodity_Name = 'ThrillWorld Classic Logo Tee';

UPDATE commodity_type
SET Image_Url = '/merchandise/steel-dragon-pullover-hoodie.jpg'
WHERE Commodity_Name = 'Steel Dragon Pullover Hoodie';

UPDATE commodity_type
SET Image_Url = '/merchandise/glow-in-dark-coaster-track-hoodie.jpg'
WHERE Commodity_Name = 'Glow-in-Dark Coaster Track Hoodie';

UPDATE commodity_type
SET Image_Url = '/merchandise/thrillworld-windbreaker-jacket.jpg'
WHERE Commodity_Name = 'ThrillWorld Windbreaker Jacket';

UPDATE commodity_type
SET Image_Url = '/merchandise/limited-edition-30th-anniversary-hoodie.jpg'
WHERE Commodity_Name = 'Limited Edition 30th Anniversary Hoodie';

-- ACCESSORIES (5 items)
UPDATE commodity_type
SET Image_Url = '/merchandise/thrillworld-snapback-cap.jpg'
WHERE Commodity_Name = 'ThrillWorld Snapback Cap';

UPDATE commodity_type
SET Image_Url = '/merchandise/3d-coaster-track-keychain.jpg'
WHERE Commodity_Name = '3D Coaster Track Keychain';

UPDATE commodity_type
SET Image_Url = '/merchandise/collector-pin-set-5-pack.jpg'
WHERE Commodity_Name = 'Collector Pin Set (5-Pack)';

UPDATE commodity_type
SET Image_Url = '/merchandise/thrillworld-mini-backpack.jpg'
WHERE Commodity_Name = 'ThrillWorld Mini Backpack';

UPDATE commodity_type
SET Image_Url = '/merchandise/light-up-coaster-car-keychain.jpg'
WHERE Commodity_Name = 'Light-Up Coaster Car Keychain';

-- TOYS & COLLECTIBLES (5 items)
UPDATE commodity_type
SET Image_Url = '/merchandise/roller-coaster-bear-plush.jpg'
WHERE Commodity_Name = 'Roller Coaster Bear Plush';

UPDATE commodity_type
SET Image_Url = '/merchandise/giant-thrillworld-dragon-plush.jpg'
WHERE Commodity_Name = 'Giant ThrillWorld Dragon Plush';

UPDATE commodity_type
SET Image_Url = '/merchandise/die-cast-coaster-train-model.jpg'
WHERE Commodity_Name = 'Die-Cast Coaster Train Model';

UPDATE commodity_type
SET Image_Url = '/merchandise/souvenir-popcorn-bucket-dragon.jpg'
WHERE Commodity_Name = 'Souvenir Popcorn Bucket - Dragon';

UPDATE commodity_type
SET Image_Url = '/merchandise/light-up-coaster-track-display.jpg'
WHERE Commodity_Name = 'Light-Up Coaster Track Display';

-- HOME & LIFESTYLE (5 items)
UPDATE commodity_type
SET Image_Url = '/merchandise/thrillworld-ceramic-coffee-mug.jpg'
WHERE Commodity_Name = 'ThrillWorld Ceramic Coffee Mug';

UPDATE commodity_type
SET Image_Url = '/merchandise/steel-dragon-insulated-tumbler.jpg'
WHERE Commodity_Name = 'Steel Dragon Insulated Tumbler';

UPDATE commodity_type
SET Image_Url = '/merchandise/led-neon-sign-thrillworld-logo.jpg'
WHERE Commodity_Name = 'LED Neon Sign - ThrillWorld Logo';

UPDATE commodity_type
SET Image_Url = '/merchandise/throw-blanket-park-map-design.jpg'
WHERE Commodity_Name = 'Throw Blanket - Park Map Design';

UPDATE commodity_type
SET Image_Url = '/merchandise/souvenir-refillable-cup-park-special.jpg'
WHERE Commodity_Name = 'Souvenir Refillable Cup (Park Special)';

-- SPECIAL ITEMS (2 items)
UPDATE commodity_type
SET Image_Url = '/merchandise/sold-out-steel-dragon-i-survived-tee.jpg'
WHERE Commodity_Name = 'SOLD OUT - Steel Dragon "I Survived" Tee';

UPDATE commodity_type
SET Image_Url = '/merchandise/low-stock-crystal-coaster-sculpture.jpg'
WHERE Commodity_Name = 'LOW STOCK - Crystal Coaster Sculpture';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the updates
SELECT 'Image URLs Updated' AS Status;
SELECT
    Commodity_Name,
    Image_Url,
    CASE
        WHEN Image_Url IS NULL THEN 'MISSING'
        WHEN Image_Url LIKE '/merchandise/%' THEN 'OK'
        ELSE 'INCORRECT'
    END AS Image_Status
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Commodity_TypeID;

-- Count items with images
SELECT
    COUNT(*) AS Total_Items,
    SUM(CASE WHEN Image_Url IS NOT NULL THEN 1 ELSE 0 END) AS Items_With_Images,
    SUM(CASE WHEN Image_Url IS NULL THEN 1 ELSE 0 END) AS Items_Without_Images
FROM commodity_type
WHERE Category = 'merchandise';
