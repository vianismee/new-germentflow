-- Add sample request status enum
CREATE TYPE IF NOT EXISTS sample_request_status AS ENUM (
    'draft',
    'on_review',
    'approved',
    'revision',
    'canceled'
);

-- Add process stage enum
CREATE TYPE IF NOT EXISTS process_stage AS ENUM (
    'embroidery',
    'dtf_printing',
    'jersey_printing',
    'sublimation',
    'dtf_sublimation'
);

-- Create sample_requests table
CREATE TABLE IF NOT EXISTS sample_requests (
    id TEXT PRIMARY KEY,
    sample_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sample_name TEXT NOT NULL,
    color TEXT,
    status sample_request_status DEFAULT 'draft' NOT NULL,
    total_order_quantity INTEGER,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create sample_material_requirements table
CREATE TABLE IF NOT EXISTS sample_material_requirements (
    id TEXT PRIMARY KEY,
    sample_request_id TEXT NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    specifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create sample_process_stages table
CREATE TABLE IF NOT EXISTS sample_process_stages (
    id TEXT PRIMARY KEY,
    sample_request_id TEXT NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
    process_stage process_stage NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create sample_status_history table
CREATE TABLE IF NOT EXISTS sample_status_history (
    id TEXT PRIMARY KEY,
    sample_request_id TEXT NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
    previous_status sample_request_status,
    new_status sample_request_status NOT NULL,
    changed_by TEXT NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sample_requests_customer_id ON sample_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_sample_requests_status ON sample_requests(status);
CREATE INDEX IF NOT EXISTS idx_sample_requests_created_at ON sample_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_sample_material_requirements_sample_request_id ON sample_material_requirements(sample_request_id);
CREATE INDEX IF NOT EXISTS idx_sample_process_stages_sample_request_id ON sample_process_stages(sample_request_id);
CREATE INDEX IF NOT EXISTS idx_sample_status_history_sample_request_id ON sample_status_history(sample_request_id);
CREATE INDEX IF NOT EXISTS idx_sample_status_history_changed_at ON sample_status_history(changed_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sample_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_sample_requests_updated_at
    BEFORE UPDATE ON sample_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_sample_requests_updated_at();