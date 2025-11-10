

UPDATE maintenance_log ml
INNER JOIN maintenance_request mr ON ml.Request_ID = mr.Request_ID
SET ml.Time_Taken_Hours = TIMESTAMPDIFF(MINUTE, mr.Request_Date, ml.Date_Performed)
WHERE ml.Time_Taken_Hours IS NULL
  AND mr.Request_Date IS NOT NULL
  AND ml.Date_Performed IS NOT NULL;



DELIMITER $$

CREATE TRIGGER calculate_time_taken_on_insert
BEFORE INSERT ON maintenance_log
FOR EACH ROW
BEGIN
    DECLARE request_date_value DATETIME;
    
    -- Get the Request_Date from the related maintenance_request
    SELECT Request_Date INTO request_date_value
    FROM maintenance_request
    WHERE Request_ID = NEW.Request_ID
    LIMIT 1;
    
    -- Calculate time taken: Date_Performed - Request_Date
    IF request_date_value IS NOT NULL AND NEW.Date_Performed IS NOT NULL THEN
        SET NEW.Time_Taken_Hours = TIMESTAMPDIFF(MINUTE, request_date_value, NEW.Date_Performed);
        
        -- Ensure non-negative (in case Date_Performed is before Request_Date)
        IF NEW.Time_Taken_Hours < 0 THEN
            SET NEW.Time_Taken_Hours = 0;
        END IF;
    ELSE
        SET NEW.Time_Taken_Hours = NULL;
    END IF;
END$$

DELIMITER ;

-- Step 5: Verify the trigger was created
SHOW TRIGGERS LIKE 'calculate_time_taken_on_insert';