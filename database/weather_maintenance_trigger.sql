CREATE TRIGGER weather_safety_protocol
AFTER INSERT ON weather
FOR EACH ROW
BEGIN
    -- Semantic Constraint: If weather is hazardous (Raining/Freezing),
    -- automatically mandate inspection for outdoor rides.
    
    IF NEW.weather_condition = 'Raining' THEN
        -- Raining affects: Water rides and high-speed outdoor coasters
        -- Water rides: Splash Zone (9), Splash Mountain (18)
        -- Outdoor coasters: Vilecoaster (1), Steel Dragon (16)
        
        -- Splash Zone (Ride 9) - water ride, safety concerns with water levels
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 9 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (9, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 9;
        END IF;

        -- Splash Mountain (Ride 18) - water ride, safety concerns with water levels
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 18 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (18, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 18;
        END IF;

        -- Vilecoaster (Ride 1) - outdoor coaster, slippery tracks in rain
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 1 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (1, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 1;
        END IF;

        -- Steel Dragon (Ride 16) - outdoor hypercoaster, slippery tracks in rain
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 16 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (16, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 16;
        END IF;
        
    ELSEIF NEW.weather_condition = 'Freezing' THEN
        -- Freezing affects: Outdoor rides that could have ice/safety issues
        -- Outdoor attractions: Fair Wheel (2), Drop Dead (4)
        -- Outdoor coaster: Twisted Cyclone (17)
        
        -- Fair Wheel (Ride 2) - outdoor attraction, could have ice buildup
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 2 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (2, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 2;
        END IF;

        -- Drop Dead (Ride 4) - outdoor drop ride, could have ice on structure
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 4 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (4, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 4;
        END IF;

        -- Twisted Cyclone (Ride 17) - outdoor coaster, track could ice
        IF NOT EXISTS (
            SELECT 1 FROM maintenance_request 
            WHERE Ride_ID = 17 AND Status IN ('Open', 'In Progress')
        ) THEN
            INSERT INTO maintenance_request 
            (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
            VALUES 
            (17, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Open', 1);
            
            UPDATE ride SET Status = 'Under Maintenance' WHERE Ride_ID = 17;
        END IF;
        
    END IF;
END