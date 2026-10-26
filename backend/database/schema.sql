-- LifeLink - Organ Donation and Procurement Management System
-- PostgreSQL Database Schema
-- Author: Rishi
-- Description: Complete database schema with constraints, indexes, and relationships

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS transplants CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS organs CASCADE;
DROP TABLE IF EXISTS recipients CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS hospital_staff CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS blood_type CASCADE;
DROP TYPE IF EXISTS organ_type CASCADE;
DROP TYPE IF EXISTS urgency_level CASCADE;
DROP TYPE IF EXISTS donor_status CASCADE;
DROP TYPE IF EXISTS recipient_status CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS transplant_status CASCADE;
DROP TYPE IF EXISTS hospital_status CASCADE;

-- Create ENUM types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'hospital_staff', 'recipient');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE organ_type AS ENUM ('heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea');
CREATE TYPE urgency_level AS ENUM ('critical', 'urgent', 'standard');
CREATE TYPE donor_status AS ENUM ('registered', 'active', 'deceased', 'inactive');
CREATE TYPE recipient_status AS ENUM ('active', 'matched', 'transplanted', 'inactive', 'deceased');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE transplant_status AS ENUM ('scheduled', 'in_progress', 'successful', 'failed', 'cancelled');
CREATE TYPE hospital_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- =====================================================
-- USERS Table (Core authentication and authorization)
-- =====================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- HOSPITALS Table
-- =====================================================
CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status hospital_status NOT NULL DEFAULT 'pending',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id),
    
    -- Constraints
    CONSTRAINT chk_phone_format CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- =====================================================
-- HOSPITAL_STAFF Table (Links users to hospitals)
-- =====================================================
CREATE TABLE hospital_staff (
    staff_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_license_number CHECK (license_number IS NULL OR LENGTH(license_number) >= 5)
);

-- =====================================================
-- DONORS Table
-- =====================================================
CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id),
    registered_by INTEGER NOT NULL REFERENCES users(user_id),
    
    -- Personal Information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type blood_type NOT NULL,
    
    -- Medical Information
    hla_typing VARCHAR(255),  -- HLA tissue type (e.g., A*02:01, B*07:02)
    weight_kg DECIMAL(5, 2),
    height_cm DECIMAL(5, 2),
    medical_history TEXT,
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    
    -- Donor specific fields
    is_living BOOLEAN NOT NULL DEFAULT false,
    consent_signed BOOLEAN NOT NULL DEFAULT false,
    consent_date DATE,
    status donor_status NOT NULL DEFAULT 'registered',
    date_of_death DATE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_donor_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
    CONSTRAINT chk_donor_death_date CHECK (date_of_death IS NULL OR date_of_death >= date_of_birth),
    CONSTRAINT chk_living_donor_no_death CHECK (is_living = false OR date_of_death IS NULL),
    CONSTRAINT chk_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0),
    CONSTRAINT chk_height_positive CHECK (height_cm IS NULL OR height_cm > 0)
);

-- =====================================================
-- ORGANS Table (Available organs from donors)
-- =====================================================
CREATE TABLE organs (
    organ_id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
    organ_type organ_type NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    procurement_date TIMESTAMP,
    expiry_time TIMESTAMP,
    blood_type blood_type NOT NULL,
    hla_typing VARCHAR(255),
    organ_condition TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    allocated_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_expiry_after_procurement CHECK (expiry_time IS NULL OR expiry_time > procurement_date)
);

-- =====================================================
-- RECIPIENTS Table (Patients on waitlist)
-- =====================================================
CREATE TABLE recipients (
    recipient_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id),
    registered_by INTEGER NOT NULL REFERENCES users(user_id),
    
    -- Personal Information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type blood_type NOT NULL,
    
    -- Medical Information
    required_organ organ_type NOT NULL,
    hla_typing VARCHAR(255),
    urgency_level urgency_level NOT NULL DEFAULT 'standard',
    medical_condition TEXT NOT NULL,
    weight_kg DECIMAL(5, 2),
    height_cm DECIMAL(5, 2),
    
    -- Contact Information
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    
    -- Waitlist Information
    waitlist_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status recipient_status NOT NULL DEFAULT 'active',
    priority_score INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_recipient_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '1 year'),
    CONSTRAINT chk_recipient_weight CHECK (weight_kg IS NULL OR weight_kg > 0),
    CONSTRAINT chk_recipient_height CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_priority_score CHECK (priority_score >= 0)
);

-- =====================================================
-- MATCHES Table (Organ-Recipient matching results)
-- =====================================================
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    organ_id INTEGER NOT NULL REFERENCES organs(organ_id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES recipients(recipient_id) ON DELETE CASCADE,
    
    -- Match scoring
    compatibility_score DECIMAL(5, 2) NOT NULL,
    hla_match_score INTEGER,
    geographic_distance_km DECIMAL(8, 2),
    
    -- Match metadata
    match_status match_status NOT NULL DEFAULT 'pending',
    matched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    response_notes TEXT,
    
    -- Constraints
    CONSTRAINT chk_compatibility_score CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    CONSTRAINT chk_hla_score CHECK (hla_match_score IS NULL OR (hla_match_score >= 0 AND hla_match_score <= 12)),
    CONSTRAINT uq_organ_recipient UNIQUE (organ_id, recipient_id)
);

-- =====================================================
-- TRANSPLANTS Table (Completed transplant records)
-- =====================================================
CREATE TABLE transplants (
    transplant_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL UNIQUE REFERENCES matches(match_id) ON DELETE RESTRICT,
    organ_id INTEGER NOT NULL REFERENCES organs(organ_id),
    donor_id INTEGER NOT NULL REFERENCES donors(donor_id),
    recipient_id INTEGER NOT NULL REFERENCES recipients(recipient_id),
    hospital_id INTEGER NOT NULL REFERENCES hospitals(hospital_id),
    
    -- Transplant details
    surgery_date TIMESTAMP NOT NULL,
    completion_date TIMESTAMP,
    status transplant_status NOT NULL DEFAULT 'scheduled',
    surgeon_name VARCHAR(100),
    surgical_team TEXT,
    
    -- Outcome
    outcome_notes TEXT,
    complications TEXT,
    follow_up_required BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_completion_after_surgery CHECK (completion_date IS NULL OR completion_date >= surgery_date)
);

-- =====================================================
-- AUDIT_LOGS Table (System activity tracking)
-- =====================================================
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Hospitals table indexes
CREATE INDEX idx_hospitals_status ON hospitals(status);
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_location ON hospitals(latitude, longitude);

-- Hospital staff table indexes
CREATE INDEX idx_hospital_staff_user ON hospital_staff(user_id);
CREATE INDEX idx_hospital_staff_hospital ON hospital_staff(hospital_id);

-- Donors table indexes
CREATE INDEX idx_donors_hospital ON donors(hospital_id);
CREATE INDEX idx_donors_blood_type ON donors(blood_type);
CREATE INDEX idx_donors_status ON donors(status);
CREATE INDEX idx_donors_living ON donors(is_living);
CREATE INDEX idx_donors_hla ON donors(hla_typing);

-- Organs table indexes
CREATE INDEX idx_organs_donor ON organs(donor_id);
CREATE INDEX idx_organs_type ON organs(organ_type);
CREATE INDEX idx_organs_available ON organs(is_available);
CREATE INDEX idx_organs_blood_type ON organs(blood_type);
CREATE INDEX idx_organs_expiry ON organs(expiry_time);

-- Recipients table indexes (Critical for matching algorithm)
CREATE INDEX idx_recipients_hospital ON recipients(hospital_id);
CREATE INDEX idx_recipients_blood_type ON recipients(blood_type);
CREATE INDEX idx_recipients_organ ON recipients(required_organ);
CREATE INDEX idx_recipients_status ON recipients(status);
CREATE INDEX idx_recipients_urgency ON recipients(urgency_level);
CREATE INDEX idx_recipients_waitlist_date ON recipients(waitlist_date);
CREATE INDEX idx_recipients_hla ON recipients(hla_typing);
CREATE INDEX idx_recipients_active_waitlist ON recipients(status, required_organ, blood_type) 
    WHERE status = 'active';

-- Matches table indexes
CREATE INDEX idx_matches_organ ON matches(organ_id);
CREATE INDEX idx_matches_recipient ON matches(recipient_id);
CREATE INDEX idx_matches_status ON matches(match_status);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);
CREATE INDEX idx_matches_date ON matches(matched_at);

-- Transplants table indexes
CREATE INDEX idx_transplants_match ON transplants(match_id);
CREATE INDEX idx_transplants_donor ON transplants(donor_id);
CREATE INDEX idx_transplants_recipient ON transplants(recipient_id);
CREATE INDEX idx_transplants_hospital ON transplants(hospital_id);
CREATE INDEX idx_transplants_status ON transplants(status);
CREATE INDEX idx_transplants_date ON transplants(surgery_date);

-- Audit logs table indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- =====================================================
-- VIEWS for Common Queries
-- =====================================================

-- Active waitlist view
CREATE VIEW v_active_waitlist AS
SELECT 
    r.recipient_id,
    r.first_name || ' ' || r.last_name AS recipient_name,
    r.blood_type,
    r.required_organ,
    r.urgency_level,
    r.waitlist_date,
    CURRENT_DATE - r.waitlist_date AS days_on_waitlist,
    h.name AS hospital_name,
    h.city,
    h.state
FROM recipients r
JOIN hospitals h ON r.hospital_id = h.hospital_id
WHERE r.status = 'active'
ORDER BY r.urgency_level DESC, r.waitlist_date ASC;

-- Available organs view
CREATE VIEW v_available_organs AS
SELECT 
    o.organ_id,
    o.organ_type,
    o.blood_type,
    o.procurement_date,
    o.expiry_time,
    d.donor_id,
    d.first_name || ' ' || d.last_name AS donor_name,
    d.is_living,
    h.name AS hospital_name,
    h.city,
    h.state
FROM organs o
JOIN donors d ON o.donor_id = d.donor_id
JOIN hospitals h ON d.hospital_id = h.hospital_id
WHERE o.is_available = true
    AND (o.expiry_time IS NULL OR o.expiry_time > CURRENT_TIMESTAMP)
ORDER BY o.procurement_date DESC;

-- System statistics view
CREATE VIEW v_system_stats AS
SELECT 
    (SELECT COUNT(*) FROM donors WHERE status IN ('active', 'registered')) AS active_donors,
    (SELECT COUNT(*) FROM recipients WHERE status = 'active') AS active_recipients,
    (SELECT COUNT(*) FROM organs WHERE is_available = true) AS available_organs,
    (SELECT COUNT(*) FROM transplants WHERE status = 'successful') AS successful_transplants,
    (SELECT COUNT(*) FROM hospitals WHERE status = 'approved') AS approved_hospitals,
    (SELECT COUNT(*) FROM matches WHERE match_status = 'pending') AS pending_matches;

-- =====================================================
-- FUNCTIONS for Business Logic
-- =====================================================

-- Function to calculate HLA match score (0-12 scale)
CREATE OR REPLACE FUNCTION calculate_hla_match_score(
    donor_hla VARCHAR,
    recipient_hla VARCHAR
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Simple HLA matching logic (can be enhanced)
    -- This is a placeholder for actual HLA matching algorithm
    IF donor_hla = recipient_hla THEN
        RETURN 12; -- Perfect match
    ELSIF donor_hla IS NULL OR recipient_hla IS NULL THEN
        RETURN NULL; -- Cannot determine
    ELSE
        -- Partial matching logic would go here
        RETURN 6; -- Partial match (simplified)
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check blood type compatibility
CREATE OR REPLACE FUNCTION is_blood_compatible(
    donor_blood blood_type,
    recipient_blood blood_type
) RETURNS BOOLEAN AS $$
BEGIN
    -- O- is universal donor
    IF donor_blood = 'O-' THEN
        RETURN TRUE;
    END IF;
    
    -- O+ can donate to all positive blood types
    IF donor_blood = 'O+' AND recipient_blood IN ('O+', 'A+', 'B+', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- A- can donate to A and AB types
    IF donor_blood = 'A-' AND recipient_blood IN ('A-', 'A+', 'AB-', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- A+ can donate to A+ and AB+
    IF donor_blood = 'A+' AND recipient_blood IN ('A+', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- B- can donate to B and AB types
    IF donor_blood = 'B-' AND recipient_blood IN ('B-', 'B+', 'AB-', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- B+ can donate to B+ and AB+
    IF donor_blood = 'B+' AND recipient_blood IN ('B+', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- AB- can donate to AB types
    IF donor_blood = 'AB-' AND recipient_blood IN ('AB-', 'AB+') THEN
        RETURN TRUE;
    END IF;
    
    -- AB+ can only donate to AB+
    IF donor_blood = 'AB+' AND recipient_blood = 'AB+' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate geographic distance (simplified)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371; -- km
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGERS for Automated Tasks
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transplants_updated_at BEFORE UPDATE ON transplants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, table_name, record_id, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.recipient_id, row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.recipient_id, row_to_json(OLD), row_to_json(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, old_values)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.recipient_id, row_to_json(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_recipients AFTER INSERT OR UPDATE OR DELETE ON recipients
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_transplants AFTER INSERT OR UPDATE OR DELETE ON transplants
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE hospitals IS 'Registered medical institutions';
COMMENT ON TABLE donors IS 'Organ donors (living and deceased)';
COMMENT ON TABLE recipients IS 'Patients on the organ waitlist';
COMMENT ON TABLE organs IS 'Available organs from donors';
COMMENT ON TABLE matches IS 'Organ-recipient matching results';
COMMENT ON TABLE transplants IS 'Completed transplant records';
COMMENT ON TABLE audit_logs IS 'System activity audit trail';

-- Schema creation complete
SELECT 'Database schema created successfully!' AS status;
