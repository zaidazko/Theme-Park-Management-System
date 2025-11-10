
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
