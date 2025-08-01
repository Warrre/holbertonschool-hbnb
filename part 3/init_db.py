#!/usr/bin/env python3
"""
Script pour initialiser la base de données et créer les tables
"""

from app import create_app, db
from app.models import User, Place, Review, Amenity
import uuid

def init_database():
    """Initialise la base de données et crée les tables"""
    app = create_app()
    
    with app.app_context():
        # Créer toutes les tables
        db.create_all()
        print("Tables créées avec succès!")
        
        # Créer un utilisateur administrateur
        admin_id = str(uuid.uuid4())
        admin = User(
            id=admin_id,
            email='admin@hbnb.com',
            password='admin1234',
            first_name='Admin',
            last_name='User'
        )
        
        # Vérifier si l'admin existe déjà
        existing_admin = User.query.filter_by(email='admin@hbnb.com').first()
        if not existing_admin:
            db.session.add(admin)
            print("Utilisateur administrateur créé!")
        else:
            print("Utilisateur administrateur existe déjà!")
        
        # Créer des équipements de base
        amenities_data = [
            'WiFi', 'Parking', 'Air Conditioning', 'Kitchen',
            'Washing Machine', 'TV', 'Pool', 'Gym', 'Pet Friendly', 'Balcony'
        ]
        
        for amenity_name in amenities_data:
            existing_amenity = Amenity.query.filter_by(name=amenity_name).first()
            if not existing_amenity:
                amenity = Amenity(name=amenity_name)
                db.session.add(amenity)
        
        # Sauvegarder les changements
        db.session.commit()
        print("Données initiales insérées avec succès!")
        
        # Afficher un résumé
        print(f"\nRésumé:")
        print(f"Utilisateurs: {User.query.count()}")
        print(f"Équipements: {Amenity.query.count()}")
        print(f"Lieux: {Place.query.count()}")
        print(f"Avis: {Review.query.count()}")

if __name__ == '__main__':
    init_database()
