-- Remove total_orders and total_value columns from customers table
-- These fields are not needed for pure tracking system

ALTER TABLE customers
DROP COLUMN IF EXISTS total_orders,
DROP COLUMN IF EXISTS total_value;

-- Add comment to clarify table purpose
COMMENT ON TABLE customers IS 'Customer information for tracking purposes only';