-- Update order status enum
ALTER TYPE order_status RENAME TO order_status_old;
CREATE TYPE order_status AS ENUM ('draft', 'on_review', 'approve', 'cancelled');

-- Update existing orders
ALTER TABLE sales_orders
ALTER COLUMN status TYPE order_status
USING
  CASE
    WHEN status = 'draft' THEN 'draft'::order_status
    WHEN status = 'processing' THEN 'on_review'::order_status
    WHEN status = 'completed' THEN 'approve'::order_status
    WHEN status = 'cancelled' THEN 'cancelled'::order_status
    ELSE 'draft'::order_status
  END;

-- Drop old enum
DROP TYPE order_status_old;