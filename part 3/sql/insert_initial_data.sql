-- Insertion de l'admin
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, is_admin, created_at, updated_at)
VALUES ('user-001', 'admin@hbnb.com', '$2b$12$afebythe7r2qxhxInqkhOevO6980sHuA8J3WEKGi7a724lye/9iZm', 'Admin', 'User', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertion d'autres utilisateurs de test
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, is_admin, created_at, updated_at)
VALUES ('user-002', 'jane@example.com', 'hashed_password', 'Jane', 'Smith', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertion d'amenities de base
INSERT OR IGNORE INTO amenities (id, name, created_at, updated_at) VALUES
('amenity-001', 'WiFi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('amenity-002', 'Parking', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('amenity-003', 'Air Conditioning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('amenity-004', 'Kitchen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('amenity-007', 'Pool', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertion de lieux de test
INSERT OR IGNORE INTO places (id, title, description, price, latitude, longitude, owner_id, created_at, updated_at) VALUES
('place-001', 'Cozy Apartment', 'Beautiful downtown apartment', 150.00, 40.7128, -74.0060, 'user-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('place-002', 'Beach House', 'Relaxing beach house with ocean view', 300.00, 25.7617, -80.1918, 'user-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Association lieux-équipements
INSERT OR IGNORE INTO place_amenity (place_id, amenity_id) VALUES
('place-001', 'amenity-001'),  -- WiFi
('place-001', 'amenity-004'),  -- Kitchen
('place-002', 'amenity-001'),  -- WiFi
('place-002', 'amenity-007'),  -- Pool
('place-002', 'amenity-002');  -- Parking

-- Insertion d'avis de test
INSERT OR IGNORE INTO reviews (id, text, rating, user_id, place_id, created_at, updated_at) VALUES
('review-001', 'Amazing place! Highly recommended.', 5, 'user-002', 'place-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('review-002', 'Great location and beautiful view.', 4, 'user-001', 'place-002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
