-- Simple SQL migration for WO-2025-022
-- This SQL can be executed directly in your database

-- Step 1: Create customer record
INSERT INTO customers (id, name, contact_person, email, phone, address, status, created_at, updated_at) VALUES
('customer-wo-2025-022', 'Bapak Riza', 'Riza', 'riza@example.com', '+62-812-3456-7890', 'Indonesia', 'active', NOW(), NOW());

-- Step 2: Create sales order record
INSERT INTO sales_orders (id, order_number, customer_id, order_date, target_delivery_date, status, total_amount, notes, created_by, created_at, updated_at) VALUES
('so-wo-2025-022', 'SO-2025-021', 'customer-wo-2025-022', '2025-10-24', '2025-11-24', 'approve', 1100000, 'Jersey order - 5XL Hitam and Jersey Longsleeve 5XL Putih', 'system-migration', NOW(), NOW());

-- Step 3: Create sales order items
INSERT INTO sales_order_items (id, sales_order_id, product_name, quantity, size, color, unit_price, total_price, specifications, created_at, updated_at) VALUES
('item-wo-2025-022-1', 'so-wo-2025-022', 'Jersey', 5, '5XL', 'Hitam', 100000, 500000, '{"type":"Regular Jersey","material":"Cotton Blend","design":"Standard"}', NOW(), NOW()),
('item-wo-2025-022-2', 'so-wo-2025-022', 'Jersey Longsleeve', 5, '5XL', 'Putih', 120000, 600000, '{"type":"Long Sleeve Jersey","material":"Cotton Blend","design":"Standard"}', NOW(), NOW());

-- Step 4: Create work order record
INSERT INTO work_orders (id, work_order_number, sales_order_id, sales_order_item_id, current_stage, started_at, completed_at, estimated_completion, priority, created_by, created_at, updated_at) VALUES
('wo-2025-022-migrated', 'WO-2025-022', 'so-wo-2025-022', 'item-wo-2025-022-1', 'cutting', '2025-10-24', NULL, '2025-11-24', 5, 'system-migration', NOW(), NOW());

-- Step 5: Create production stage history
INSERT INTO production_stage_history (id, work_order_id, stage, started_at, completed_at, duration, notes, user_id, created_at) VALUES
('stage-wo-2025-022-1', 'wo-2025-022-migrated', 'order_processing', '2025-10-24', '2025-10-24', 60, 'Order processed and ready for material procurement', 'system-migration', NOW()),
('stage-wo-2025-022-2', 'wo-2025-022-migrated', 'material_procurement', '2025-10-24', '2025-10-24', 120, 'Materials procured successfully', 'system-migration', NOW()),
('stage-wo-2025-022-3', 'wo-2025-022-migrated', 'cutting', '2025-10-24', NULL, NULL, 'Currently in cutting stage - 100 items passed QC', 'system-migration', NOW());

-- Step 6: Create quality control inspection record
INSERT INTO quality_inspections (id, work_order_id, stage, status, inspected_by, inspection_date, total_quantity, passed_quantity, repaired_quantity, rejected_quantity, issues, repair_notes, reinspection_date, final_status, created_at, updated_at) VALUES
('qc-wo-2025-022-migrated', 'wo-2025-022-migrated', 'cutting', 'pass', 'system-migration', NOW(), 10, 100, 0, 0, NULL, NULL, NULL, 'pass', NOW(), NOW());

-- Migration completed
SELECT 'WO-2025-022 Migration Completed!' as message,
       'Customer: Bapak Riza' as customer,
       'Sales Order: SO-2025-021' as sales_order,
       'Work Order: WO-2025-022' as work_order,
       'Current Stage: cutting' as current_stage,
       'QC Result: 100 passed, 0 repaired, 0 rejected' as qc_result;