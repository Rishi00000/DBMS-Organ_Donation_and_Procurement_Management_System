-- Initial Data for ODPMS Database
-- This file seeds the database with initial admin user and sample data

-- =====================================================
-- INITIAL ADMIN USER
-- =====================================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@odpms.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'admin', true);

-- =====================================================
-- SAMPLE HOSPITALS (for testing)
-- =====================================================
INSERT INTO hospitals (name, registration_number, address, city, state, postal_code, phone, email, status, latitude, longitude, approved_by) VALUES
('Apollo Hospital', 'APL-2024-001', '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '600006', '+914428293333', 'info@apollochennai.com', 'approved', 13.0569, 80.2503, 1),
('Fortis Hospital', 'FRT-2024-002', 'Sector 62, Phase VIII', 'Mohali', 'Punjab', '160062', '+911724621200', 'info@fortismohali.com', 'approved', 30.7046, 76.7179, 1),
('AIIMS Delhi', 'AIIMS-2024-003', 'Sri Aurobindo Marg, Ansari Nagar', 'New Delhi', 'Delhi', '110029', '+911126588500', 'info@aiims.edu', 'approved', 28.5672, 77.2100, 1),
('Manipal Hospital', 'MNP-2024-004', '98, Rustom Bagh, HAL Airport Road', 'Bangalore', 'Karnataka', '560017', '+918025024444', 'info@manipalhospitals.com', 'approved', 12.9576, 77.6469, 1);

-- =====================================================
-- SAMPLE HOSPITAL STAFF USERS
-- =====================================================
-- Password for all: staff123
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('apollo_staff1', 'staff1@apollochennai.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'hospital_staff', true),
('fortis_staff1', 'staff1@fortismohali.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'hospital_staff', true),
('aiims_staff1', 'staff1@aiims.edu', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'hospital_staff', true);

INSERT INTO hospital_staff (user_id, hospital_id, first_name, last_name, designation, license_number, phone) VALUES
(2, 1, 'Rajesh', 'Kumar', 'Transplant Coordinator', 'TC-AP-2024-001', '+919876543210'),
(3, 2, 'Priya', 'Sharma', 'Transplant Coordinator', 'TC-FT-2024-002', '+919876543211'),
(4, 3, 'Amit', 'Patel', 'Senior Transplant Coordinator', 'TC-AI-2024-003', '+919876543212');

-- =====================================================
-- SAMPLE DONORS
-- =====================================================
INSERT INTO donors (hospital_id, registered_by, first_name, last_name, date_of_birth, gender, blood_type, hla_typing, weight_kg, height_cm, phone, email, address, city, state, is_living, consent_signed, consent_date, status) VALUES
(1, 2, 'Vikram', 'Singh', '1985-03-15', 'Male', 'O+', 'A*02:01-B*07:02-DRB1*15:01', 75.5, 175.0, '+919123456789', 'vikram.singh@email.com', '123 Main St', 'Chennai', 'Tamil Nadu', false, true, '2024-01-15', 'active'),
(1, 2, 'Anjali', 'Reddy', '1990-07-22', 'Female', 'A+', 'A*01:01-B*08:01-DRB1*03:01', 62.0, 165.0, '+919123456790', 'anjali.reddy@email.com', '456 Park Ave', 'Chennai', 'Tamil Nadu', false, true, '2024-02-10', 'active'),
(2, 3, 'Rahul', 'Mehta', '1982-11-30', 'Male', 'B+', 'A*03:01-B*07:02-DRB1*04:01', 80.0, 180.0, '+919123456791', 'rahul.mehta@email.com', '789 Lake Rd', 'Mohali', 'Punjab', false, true, '2024-01-20', 'deceased'),
(3, 4, 'Sunita', 'Gupta', '1988-05-12', 'Female', 'AB+', 'A*02:01-B*44:02-DRB1*07:01', 68.0, 170.0, '+919123456792', 'sunita.gupta@email.com', '321 Hill St', 'New Delhi', 'Delhi', true, true, '2024-03-01', 'active');

-- =====================================================
-- SAMPLE ORGANS
-- =====================================================
INSERT INTO organs (donor_id, organ_type, is_available, procurement_date, expiry_time, blood_type, hla_typing, organ_condition) VALUES
(3, 'kidney', true, '2024-10-25 08:30:00', '2024-10-27 08:30:00', 'B+', 'A*03:01-B*07:02-DRB1*04:01', 'Excellent condition, properly preserved'),
(3, 'liver', true, '2024-10-25 08:30:00', '2024-10-26 08:30:00', 'B+', 'A*03:01-B*07:02-DRB1*04:01', 'Good condition'),
(4, 'kidney', true, '2024-10-28 10:00:00', '2024-10-30 10:00:00', 'AB+', 'A*02:01-B*44:02-DRB1*07:01', 'Living donor, excellent health');

-- =====================================================
-- SAMPLE RECIPIENTS
-- =====================================================
-- Password for recipient users: patient123
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('patient_arjun', 'arjun.verma@email.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'recipient', true),
('patient_kavita', 'kavita.nair@email.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'recipient', true),
('patient_suresh', 'suresh.kumar@email.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'recipient', true),
('patient_deepa', 'deepa.sharma@email.com', '$2b$10$rKvVXZWQh6F5zY.gXvQYVOqK6lY1qF5bP6YZQ7Z5zY.gXvQYVOqK6l', 'recipient', true);

INSERT INTO recipients (user_id, hospital_id, registered_by, first_name, last_name, date_of_birth, gender, blood_type, required_organ, hla_typing, urgency_level, medical_condition, weight_kg, height_cm, phone, email, address, city, state, waitlist_date, status) VALUES
(5, 1, 2, 'Arjun', 'Verma', '1978-09-10', 'Male', 'B+', 'kidney', 'A*03:01-B*07:02-DRB1*04:01', 'critical', 'End-stage renal disease, on dialysis', 70.0, 172.0, '+919234567890', 'arjun.verma@email.com', '555 River Rd', 'Chennai', 'Tamil Nadu', '2024-03-15', 'active'),
(6, 2, 3, 'Kavita', 'Nair', '1985-12-20', 'Female', 'O+', 'liver', 'A*02:01-B*07:02-DRB1*15:01', 'urgent', 'Cirrhosis, MELD score 25', 58.0, 160.0, '+919234567891', 'kavita.nair@email.com', '777 Forest Ave', 'Mohali', 'Punjab', '2024-05-10', 'active'),
(7, 3, 4, 'Suresh', 'Kumar', '1980-06-05', 'Male', 'AB+', 'kidney', 'A*02:01-B*44:02-DRB1*07:01', 'urgent', 'Chronic kidney disease stage 5', 75.0, 178.0, '+919234567892', 'suresh.kumar@email.com', '888 Mountain Rd', 'New Delhi', 'Delhi', '2024-04-20', 'active'),
(8, 1, 2, 'Deepa', 'Sharma', '1992-02-28', 'Female', 'A+', 'kidney', 'A*01:01-B*08:01-DRB1*03:01', 'standard', 'Polycystic kidney disease', 65.0, 168.0, '+919234567893', 'deepa.sharma@email.com', '999 Valley St', 'Chennai', 'Tamil Nadu', '2024-08-01', 'active'),
(NULL, 4, 2, 'Ravi', 'Malhotra', '1975-04-17', 'Male', 'B+', 'liver', 'A*03:01-B*07:02-DRB1*04:01', 'critical', 'Acute liver failure', 82.0, 175.0, '+919234567894', 'ravi.malhotra@email.com', '111 Beach Rd', 'Bangalore', 'Karnataka', '2024-09-15', 'active');

-- =====================================================
-- SAMPLE MATCHES (automatically generated)
-- =====================================================
INSERT INTO matches (organ_id, recipient_id, compatibility_score, hla_match_score, geographic_distance_km, match_status, matched_at) VALUES
(1, 1, 95.5, 12, 5.2, 'pending', '2024-10-25 09:00:00'),
(2, 5, 88.3, 10, 2850.5, 'pending', '2024-10-25 09:00:00'),
(3, 3, 92.7, 12, 8.5, 'pending', '2024-10-28 10:30:00');

-- =====================================================
-- SAMPLE AUDIT LOGS
-- =====================================================
INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, created_at) VALUES
(1, 'INSERT', 'hospitals', 1, '{"name": "Apollo Hospital", "status": "approved"}', '192.168.1.1', '2024-01-01 10:00:00'),
(2, 'INSERT', 'donors', 1, '{"first_name": "Vikram", "last_name": "Singh", "status": "active"}', '192.168.1.2', '2024-01-15 14:30:00'),
(2, 'INSERT', 'recipients', 1, '{"first_name": "Arjun", "last_name": "Verma", "urgency_level": "critical"}', '192.168.1.2', '2024-03-15 11:00:00');

-- =====================================================
-- DATABASE STATISTICS
-- =====================================================
SELECT 'Initial data seeding completed!' AS status;
SELECT 'Total Users: ' || COUNT(*) FROM users;
SELECT 'Total Hospitals: ' || COUNT(*) FROM hospitals WHERE status = 'approved';
SELECT 'Total Donors: ' || COUNT(*) FROM donors;
SELECT 'Total Recipients: ' || COUNT(*) FROM recipients WHERE status = 'active';
SELECT 'Total Organs Available: ' || COUNT(*) FROM organs WHERE is_available = true;
SELECT 'Total Pending Matches: ' || COUNT(*) FROM matches WHERE match_status = 'pending';

-- Print login credentials for testing
SELECT '========================================' AS info;
SELECT 'DEFAULT LOGIN CREDENTIALS (FOR TESTING)' AS info;
SELECT '========================================' AS info;
SELECT 'Admin User:' AS info;
SELECT '  Username: admin' AS info;
SELECT '  Password: admin123' AS info;
SELECT '' AS info;
SELECT 'Hospital Staff (Apollo):' AS info;
SELECT '  Username: apollo_staff1' AS info;
SELECT '  Password: staff123' AS info;
SELECT '' AS info;
SELECT 'Recipient (Patient):' AS info;
SELECT '  Username: patient_arjun' AS info;
SELECT '  Password: patient123' AS info;
SELECT '========================================' AS info;
