-- ========================================
-- Remove 3 items from Apparel category
-- Move them to more appropriate categories
-- ========================================

USE theme_park;

-- Steel Dragon Insulated Tumbler → Home (it's drinkware)
UPDATE commodity_type
SET Display_Category = 'Home'
WHERE Commodity_Name = 'Steel Dragon Insulated Tumbler';

-- Limited Edition 30th Anniversary Hoodie → Souvenirs (limited edition collectible)
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Commodity_Name = 'Limited Edition 30th Anniversary Hoodie';

-- SOLD OUT Steel Dragon "I Survived" Tee → Souvenirs (novelty/special item)
UPDATE commodity_type
SET Display_Category = 'Souvenirs'
WHERE Commodity_Name = 'SOLD OUT - Steel Dragon "I Survived" Tee';

-- Verify the changes
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Display_Category,
    Stock_Quantity
FROM commodity_type
WHERE Commodity_Name IN (
    'Limited Edition 30th Anniversary Hoodie',
    'Steel Dragon Insulated Tumbler',
    'SOLD OUT - Steel Dragon "I Survived" Tee'
)
ORDER BY Commodity_Name;

-- Show all items by category
SELECT
    Display_Category,
    COUNT(*) as Item_Count
FROM commodity_type
WHERE Category = 'merchandise'
GROUP BY Display_Category
ORDER BY Display_Category;

SELECT '3 items moved out of Apparel!' as Status;
