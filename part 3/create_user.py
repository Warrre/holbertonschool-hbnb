#!/usr/bin/env python3
"""Script simple pour créer un utilisateur de test"""

from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    # Créer les tables si elles n'existent pas
    db.create_all()
    
    # Vérifier si l'utilisateur existe déjà
    existing_user = User.query.filter_by(email='test@hbnb.com').first()
    
    if not existing_user:
        # Créer un utilisateur de test
        test_user = User(
            first_name='Test',
            last_name='User',
            email='test@hbnb.com',
            password='password123'
        )
        
        db.session.add(test_user)
        db.session.commit()
        
        print("✅ Utilisateur de test créé avec succès!")
        print("Email: test@hbnb.com")
        print("Mot de passe: password123")
    else:
        print("ℹ️ L'utilisateur de test existe déjà")
        print("Email: test@hbnb.com")
        print("Mot de passe: password123")
