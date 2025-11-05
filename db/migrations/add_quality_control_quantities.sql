-- Add quantity fields to quality_inspections table
-- This migration adds support for granular pass/repair/reject quantities

ALTER TABLE quality_inspections
ADD COLUMN total_quantity INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN passed_quantity INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN repaired_quantity INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN rejected_quantity INTEGER DEFAULT 0 NOT NULL;

-- Create a check constraint to ensure quantities don't go negative
ALTER TABLE quality_inspections
ADD CONSTRAINT qc_quantities_non_negative
CHECK (
  total_quantity >= 0 AND
  passed_quantity >= 0 AND
  repaired_quantity >= 0 AND
  rejected_quantity >= 0
);

-- Create index for better query performance on quantity fields
CREATE INDEX idx_qc_quantities ON quality_inspections(total_quantity, passed_quantity, repaired_quantity, rejected_quantity);

-- Add comment to explain the new fields
COMMENT ON COLUMN quality_inspections.total_quantity IS 'Total number of items inspected';
COMMENT ON COLUMN quality_inspections.passed_quantity IS 'Number of items that passed inspection';
COMMENT ON COLUMN quality_inspections.repaired_quantity IS 'Number of items with repairable issues';
COMMENT ON COLUMN quality_inspections.rejected_quantity IS 'Number of items rejected due to major issues';