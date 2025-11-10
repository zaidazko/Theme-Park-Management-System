-- Trigger to set Alert_ID to 4 when maintenance request Status is updated to "Completed"
-- This trigger runs BEFORE UPDATE on maintenance_request table
-- Using BEFORE UPDATE allows us to set NEW.Alert_ID directly, avoiding recursive updates

-- Create the trigger
-- Note: DELIMITER is used to change the statement separator from ; to $$
-- This is needed because the trigger body contains semicolons
-- In DBeaver, you may need to execute this in a specific way (see instructions below)

DELIMITER $$

CREATE TRIGGER update_alert_on_maintenance_complete
BEFORE UPDATE ON maintenance_request
FOR EACH ROW
BEGIN
    -- Check if status is being changed to "Completed"
    IF NEW.Status = 'Completed' AND (OLD.Status IS NULL OR OLD.Status != 'Completed') THEN
        -- Set Alert_ID to 4 (None) when maintenance is completed
        SET NEW.Alert_ID = 4;
    END IF;
END$$

DELIMITER ;

-- Verify the trigger was created
SHOW TRIGGERS LIKE 'update_alert_on_maintenance_complete';

-- Test query to verify trigger works (uncomment to test):
-- UPDATE maintenance_request SET Status = 'Completed' WHERE Request_ID = 1;
-- SELECT Request_ID, Status, Alert_ID FROM maintenance_request WHERE Request_ID = 1;
