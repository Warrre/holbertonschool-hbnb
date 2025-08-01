-- CRUD OPERATIONS TEST SCRIPT

-- Insertion d'utilisateur de test
INSERT INTO users (id, email, password, first_name, last_name, is_admin, created_at, updated_at)
VALUES ('test-user-001', 'test@example.com', 'hashed_password', 'Test', 'User', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertion de lieu de test
INSERT INTO places (id, title, description, price, latitude, longitude, owner_id, created_at, updated_at)
VALUES ('test-place-001', 'Test Apartment', 'A nice test apartment', 100.0, 40.7128, -74.0060, 'test-user-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertion d'avis de test
INSERT INTO reviews (id, text, rating, user_id, place_id, created_at, updated_at)
VALUES ('test-review-001', 'Great place!', 5, 'test-user-001', 'test-place-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Vérification finale
SELECT 'Final record counts:' as Summary;
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Places', COUNT(*) FROM places
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Amenities', COUNT(*) FROM amenities
UNION ALL
SELECT 'Place_Amenity', COUNT(*) FROM place_amenity;
