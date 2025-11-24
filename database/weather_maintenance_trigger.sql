DELIMITER $$

CREATE TRIGGER weather_safety_protocol
AFTER INSERT ON weather
FOR EACH ROW
BEGIN
    -- Semantic Constraint: If weather is hazardous (Raining/Freezing),
    -- automatically mandate inspection for outdoor rides.
    
    IF NEW.weather_condition IN ('Raining', 'Freezing') THEN
        
        -- Insert request for Ride 1 (e.g., Hyper Coaster)
        INSERT INTO maintenance_request 
        (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
        VALUES 
        (1, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Pending', 1);

        -- Insert request for Ride 2 (e.g., Water Ride)
        INSERT INTO maintenance_request 
        (Ride_ID, Reported_By, Issue_Description, Request_Date, Status, Alert_ID)
        VALUES 
        (2, NEW.reported_by, CONCAT('Weather Safety Protocol: ', NEW.weather_condition), NOW(), 'Pending', 1);
        
    END IF;
END$$

DELIMITER ;

