-- Seed Restaurants and Menu Items for Theme Park
-- This script adds sample restaurants and their menu items

-- Insert Restaurants
INSERT INTO restaurant (Restaurant_Name, Location, Cuisine_Type, Opening_Time, Closing_Time)
SELECT 'The Burger Palace', 'Main Street', 'American', '10:00:00', '22:00:00'
WHERE NOT EXISTS (SELECT 1 FROM restaurant WHERE Restaurant_Name = 'The Burger Palace');

INSERT INTO restaurant (Restaurant_Name, Location, Cuisine_Type, Opening_Time, Closing_Time)
SELECT 'Pizza Paradise', 'Adventure Land', 'Italian', '11:00:00', '21:00:00'
WHERE NOT EXISTS (SELECT 1 FROM restaurant WHERE Restaurant_Name = 'Pizza Paradise');

INSERT INTO restaurant (Restaurant_Name, Location, Cuisine_Type, Opening_Time, Closing_Time)
SELECT 'Taco Fiesta', 'Frontier Zone', 'Mexican', '10:30:00', '21:30:00'
WHERE NOT EXISTS (SELECT 1 FROM restaurant WHERE Restaurant_Name = 'Taco Fiesta');

INSERT INTO restaurant (Restaurant_Name, Location, Cuisine_Type, Opening_Time, Closing_Time)
SELECT 'Sweet Treats Cafe', 'Fantasy Plaza', 'Desserts', '09:00:00', '23:00:00'
WHERE NOT EXISTS (SELECT 1 FROM restaurant WHERE Restaurant_Name = 'Sweet Treats Cafe');

INSERT INTO restaurant (Restaurant_Name, Location, Cuisine_Type, Opening_Time, Closing_Time)
SELECT 'Dragon Noodle House', 'Asia Gardens', 'Asian', '11:00:00', '22:00:00'
WHERE NOT EXISTS (SELECT 1 FROM restaurant WHERE Restaurant_Name = 'Dragon Noodle House');

-- Get restaurant IDs for menu items
SET @burger_palace_id = (SELECT Restaurant_ID FROM restaurant WHERE Restaurant_Name = 'The Burger Palace');
SET @pizza_paradise_id = (SELECT Restaurant_ID FROM restaurant WHERE Restaurant_Name = 'Pizza Paradise');
SET @taco_fiesta_id = (SELECT Restaurant_ID FROM restaurant WHERE Restaurant_Name = 'Taco Fiesta');
SET @sweet_treats_id = (SELECT Restaurant_ID FROM restaurant WHERE Restaurant_Name = 'Sweet Treats Cafe');
SET @dragon_noodle_id = (SELECT Restaurant_ID FROM restaurant WHERE Restaurant_Name = 'Dragon Noodle House');

-- Menu Items for The Burger Palace
INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'Classic Cheeseburger', 'Beef patty with cheddar, lettuce, tomato, pickles', 12.99, 'Burgers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'Classic Cheeseburger');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'Bacon BBQ Burger', 'Loaded with bacon, BBQ sauce, and crispy onions', 14.99, 'Burgers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'Bacon BBQ Burger');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'Veggie Burger', 'Plant-based patty with avocado and special sauce', 11.99, 'Burgers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'Veggie Burger');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'French Fries', 'Crispy golden fries', 4.99, 'Sides', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'French Fries');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'Onion Rings', 'Beer-battered onion rings', 5.99, 'Sides', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'Onion Rings');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @burger_palace_id, 'Milkshake', 'Vanilla, chocolate, or strawberry', 6.99, 'Beverages', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @burger_palace_id AND Item_Name = 'Milkshake');

-- Menu Items for Pizza Paradise
INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Margherita Pizza', 'Fresh mozzarella, basil, tomato sauce', 14.99, 'Pizza', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Margherita Pizza');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Pepperoni Pizza', 'Classic pepperoni with mozzarella', 16.99, 'Pizza', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Pepperoni Pizza');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Meat Lovers Pizza', 'Pepperoni, sausage, bacon, ham', 18.99, 'Pizza', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Meat Lovers Pizza');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Caesar Salad', 'Romaine, parmesan, croutons, Caesar dressing', 8.99, 'Salads', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Caesar Salad');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Garlic Bread', 'Toasted with garlic butter and herbs', 5.99, 'Sides', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Garlic Bread');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @pizza_paradise_id, 'Italian Soda', 'Sparkling water with flavored syrup', 3.99, 'Beverages', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @pizza_paradise_id AND Item_Name = 'Italian Soda');

-- Menu Items for Taco Fiesta
INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Beef Tacos', 'Three soft or hard shell tacos with seasoned beef', 9.99, 'Tacos', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Beef Tacos');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Chicken Quesadilla', 'Grilled chicken with cheese in flour tortilla', 11.99, 'Quesadillas', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Chicken Quesadilla');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Burrito Bowl', 'Rice, beans, meat, veggies, salsa, and sour cream', 12.99, 'Bowls', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Burrito Bowl');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Nachos Supreme', 'Loaded with cheese, jalapenos, beans, and salsa', 10.99, 'Appetizers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Nachos Supreme');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Churros', 'Cinnamon sugar churros with chocolate sauce', 6.99, 'Desserts', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Churros');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @taco_fiesta_id, 'Horchata', 'Sweet rice cinnamon drink', 4.99, 'Beverages', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @taco_fiesta_id AND Item_Name = 'Horchata');

-- Menu Items for Sweet Treats Cafe
INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Ice Cream Sundae', 'Three scoops with toppings and whipped cream', 8.99, 'Ice Cream', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Ice Cream Sundae');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Chocolate Brownie', 'Warm brownie with vanilla ice cream', 7.99, 'Desserts', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Chocolate Brownie');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Funnel Cake', 'Classic fried dough with powdered sugar', 9.99, 'Desserts', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Funnel Cake');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Cotton Candy', 'Fluffy spun sugar in various flavors', 5.99, 'Candy', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Cotton Candy');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Caramel Apple', 'Fresh apple dipped in caramel', 6.99, 'Candy', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Caramel Apple');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @sweet_treats_id, 'Lemonade', 'Fresh squeezed lemonade', 4.99, 'Beverages', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @sweet_treats_id AND Item_Name = 'Lemonade');

-- Menu Items for Dragon Noodle House
INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Ramen Bowl', 'Traditional ramen with pork, egg, and vegetables', 13.99, 'Noodles', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Ramen Bowl');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Pad Thai', 'Stir-fried rice noodles with shrimp or chicken', 12.99, 'Noodles', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Pad Thai');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Fried Rice', 'Wok-fried rice with vegetables and choice of protein', 10.99, 'Rice Dishes', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Fried Rice');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 6.99, 'Appetizers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Spring Rolls');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Dumplings', 'Steamed or fried pork dumplings', 8.99, 'Appetizers', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Dumplings');

INSERT INTO menu_item (Restaurant_ID, Item_Name, Item_Description, Price, Category, Available)
SELECT @dragon_noodle_id, 'Bubble Tea', 'Milk tea with tapioca pearls', 5.99, 'Beverages', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_item WHERE Restaurant_ID = @dragon_noodle_id AND Item_Name = 'Bubble Tea');

-- Verify data
SELECT 'Restaurants:' AS Info;
SELECT Restaurant_ID, Restaurant_Name, Location, Cuisine_Type FROM restaurant;

SELECT 'Menu Items Count by Restaurant:' AS Info;
SELECT r.Restaurant_Name, COUNT(m.Menu_ID) AS ItemCount
FROM restaurant r
LEFT JOIN menu_item m ON r.Restaurant_ID = m.Restaurant_ID
GROUP BY r.Restaurant_ID, r.Restaurant_Name;
