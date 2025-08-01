#!/usr/bin/env python3
"""
Script de test pour vérifier les opérations CRUD avec SQLAlchemy
"""

from app import create_app, db
from app.models import User, Place, Review, Amenity
import uuid

def test_crud_operations():
    """Test les opérations CRUD sur toutes les entités"""
    app = create_app()
    
    with app.app_context():
        print("=== Test des opérations CRUD ===\n")
        
        # Test 1: Créer un utilisateur
        print("1. Test création d'utilisateur...")
        user = User(
            email='nwf@example.com',
            password='azerty123',
            first_name='Nawfel',
            last_name='Laklit'
        )
        print("Hash du mot de passe:", user.password_hash)
        assert user.password_hash.startswith('$2'), "Le hash ne commence pas par $2 (bcrypt)"
        assert 'azerty123' not in user.password_hash, "Le mot de passe est stocké en clair !"
        
        db.session.add(user)
        db.session.commit()
        print(f"✓ Utilisateur créé avec ID: {user.id}")
        
        # Test 2: Créer des équipements
        print("\n2. Test création d'équipements...")
        wifi = Amenity(name='Test WiFi')
        parking = Amenity(name='Test Parking')
        db.session.add_all([wifi, parking])
        db.session.commit()
        print(f"✓ Équipements créés: {wifi.name}, {parking.name}")
        
        # Test 3: Créer un lieu
        print("\n3. Test création de lieu...")
        place = Place(
            title='Test Apartment',
            description='A beautiful test apartment',
            price=150.0,
            latitude=40.7128,
            longitude=-74.0060,
            owner_id=user.id
        )
        place.amenities.extend([wifi, parking])  # Association many-to-many
        db.session.add(place)
        db.session.commit()
        print(f"✓ Lieu créé avec ID: {place.id}")
        print(f"  Équipements associés: {len(place.amenities)}")
        
        # Test 4: Créer un avis
        print("\n4. Test création d'avis...")
        review = Review(
            text='Excellent place to stay!',
            rating=5,
            user_id=user.id,
            place_id=place.id
        )
        db.session.add(review)
        db.session.commit()
        print(f"✓ Avis créé avec ID: {review.id}")
        
        # Test 5: Test des lectures avec relations
        print("\n5. Test des relations...")
        
        # Lecture via relations
        user_from_db = User.query.get(user.id)
        print(f"✓ Utilisateur {user_from_db.first_name} possède {len(user_from_db.places)} lieu(x)")
        print(f"✓ Utilisateur {user_from_db.first_name} a écrit {len(user_from_db.reviews)} avis")
        
        place_from_db = Place.query.get(place.id)
        print(f"✓ Lieu '{place_from_db.title}' a {len(place_from_db.reviews)} avis")
        print(f"✓ Lieu '{place_from_db.title}' a {len(place_from_db.amenities)} équipements")
        print(f"✓ Propriétaire du lieu: {place_from_db.owner.first_name} {place_from_db.owner.last_name}")
        
        # Test 6: Mise à jour
        print("\n6. Test mise à jour...")
        place_from_db.price = 175.0
        place_from_db.update({'description': 'Updated beautiful apartment'})
        db.session.commit()
        print(f"✓ Prix mis à jour: {place_from_db.price}")
        print(f"✓ Description mise à jour: {place_from_db.description}")
        
        # Test 7: Statistiques finales
        print("\n7. Statistiques de la base de données:")
        print(f"✓ Total utilisateurs: {User.query.count()}")
        print(f"✓ Total lieux: {Place.query.count()}")
        print(f"✓ Total avis: {Review.query.count()}")
        print(f"✓ Total équipements: {Amenity.query.count()}")
        
        # Test 8: Nettoyage (optionnel)
        print("\n8. Nettoyage des données de test...")
        db.session.delete(review)
        db.session.delete(place)
        db.session.delete(user)
        db.session.delete(wifi)
        db.session.delete(parking)
        db.session.commit()
        print("✓ Données de test supprimées")
        
        print("\n=== Tous les tests sont passés avec succès! ===")

if __name__ == '__main__':
    test_crud_operations()
