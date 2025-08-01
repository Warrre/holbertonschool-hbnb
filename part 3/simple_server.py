#!/usr/bin/env python3
"""Serveur HBnB simple avec Flask basique"""

import sqlite3
import json
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

# Ajouter les headers CORS manuellement
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Fonction pour hasher les mots de passe
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Fonction pour vérifier les mots de passe
def check_password(password, hashed):
    return hash_password(password) == hashed

# Initialiser la base de données
def init_db():
    conn = sqlite3.connect('hbnb_simple.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0
        )
    ''')
    
    # Créer un utilisateur de test
    test_email = 'test@hbnb.com'
    cursor.execute('SELECT * FROM users WHERE email = ?', (test_email,))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO users (id, first_name, last_name, email, password_hash, is_admin)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('test-user-123', 'Test', 'User', test_email, hash_password('password123'), 0))
        print(f"✅ Utilisateur créé: {test_email} / password123")
    
    conn.commit()
    conn.close()

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = sqlite3.connect('hbnb_simple.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE email = ?', (data['email'],))
    user = cursor.fetchone()
    
    if user and check_password(data['password'], user[4]):  # user[4] est password_hash
        # Simuler un token JWT simple
        token = f"token-{user[0]}-{user[5]}"  # user[0] = id, user[5] = is_admin
        return jsonify({'access_token': token}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    conn.close()

@app.route('/api/v1/places', methods=['GET'])
def get_places():
    # Données de test des places
    places = [
        {
            "id": "logement-occasion",
            "name": "Logement d'Occasion",
            "price": 50,
            "description": "Logement confortable et abordable, parfait pour un séjour économique sans compromis sur le confort.",
            "location": "Centre-ville",
            "image": "https://cdn.generationvoyage.fr/2022/02/logement-2-1.png"
        },
        {
            "id": "appartement-ville",
            "name": "Appartement en Ville",
            "price": 50,
            "description": "Logement moderne au cœur de la ville, proche de tous les commerces.",
            "location": "Centre urbain",
            "image": "https://cdn.generationvoyage.fr/2022/02/logement-7-1.png"
        },
        {
            "id": "studio-building",
            "name": "Studio dans un Building",
            "price": 100,
            "description": "Studio élégant dans un immeuble moderne avec toutes les commodités.",
            "location": "Quartier moderne",
            "image": "https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0"
        },
        {
            "id": "logement-naturel",
            "name": "Logement Naturel",
            "price": 100,
            "description": "Échappez-vous dans ce logement en pleine nature, calme et ressourçant.",
            "location": "Pleine nature",
            "image": "https://offloadmedia.feverup.com/lyonsecret.com/wp-content/uploads/2021/06/29070343/shutterstock_1531738394-1-1024x683.jpg"
        },
        {
            "id": "villa-piscine",
            "name": "Villa avec Piscine",
            "price": 200,
            "description": "Magnifique villa avec piscine privée, idéale pour des vacances de rêve.",
            "location": "Bord de mer",
            "image": "https://th.bing.com/th/id/R.870bb196d67e6dd3f9c7b091a4477db6?rik=RFL%2bguP6w8DTWA&riu=http%3a%2f%2fwww.gordes-luberon.com%2fztock%2fgordes-luberon-location-piscine.jpg"
        },
        {
            "id": "logement-luxe",
            "name": "Logement de Luxe",
            "price": 200,
            "description": "Expérience haut de gamme dans ce logement luxueux avec services premium.",
            "location": "Quartier huppé",
            "image": "https://th.bing.com/th/id/R.71168989b965ab7a44303873f6d662e1?rik=Qan76jaH30nDSw&pid=ImgRaw&r=0"
        },
        {
            "id": "logement-atypique",
            "name": "Logement Atypique",
            "price": 200,
            "description": "Logement unique et original pour une expérience inoubliable et authentique.",
            "location": "Lieu unique",
            "image": "https://th.bing.com/th/id/R.a9f34fe1621bc5b434560f2108eea67c?rik=35e6%2fBt8noSMEA&pid=ImgRaw&r=0"
        }
    ]
    return jsonify(places), 200

@app.route('/api/v1/places/<place_id>', methods=['GET'])
def get_place_details(place_id):
    # Données détaillées des places avec amenities et reviews
    places_details = {
        "logement-occasion": {
            "id": "logement-occasion",
            "name": "Logement d'Occasion",
            "price": 50,
            "description": "Logement confortable et abordable, parfait pour un séjour économique sans compromis sur le confort. Excellent rapport qualité-prix dans un cadre agréable avec tous les équipements nécessaires.",
            "location": "Centre-ville",
            "image": "https://cdn.generationvoyage.fr/2022/02/logement-2-1.png",
            "amenities": ["WiFi gratuit", "Cuisine équipée", "Parking gratuit", "Lave-linge", "Balcon", "Proximité commerces"],
            "reviews": [
                {
                    "id": "rev1",
                    "user_name": "Harry Kane",
                    "rating": 4,
                    "comment": "Très bon rapport qualité-prix ! Logement propre et bien situé.",
                    "created_at": "2025-07-20"
                },
                {
                    "id": "rev2",
                    "user_name": "Sané Leroy",
                    "rating": 4,
                    "comment": "Parfait pour un budget serré, je recommande vivement !",
                    "created_at": "2025-07-15"
                }
            ]
        },
        "appartement-ville": {
            "id": "appartement-ville",
            "name": "Appartement en Ville",
            "price": 50,
            "description": "Logement moderne au cœur de la ville, proche de tous les commerces. Parfait pour explorer la ville à pied et profiter de tous les services urbains.",
            "location": "Centre urbain",
            "image": "https://cdn.generationvoyage.fr/2022/02/logement-7-1.png",
            "amenities": ["WiFi haut débit", "Cuisine moderne", "Balcon", "Climatisation", "Parking", "Transports en commun"],
            "reviews": [
                {
                    "id": "rev3",
                    "user_name": "William Rousseau",
                    "rating": 5,
                    "comment": "Emplacement parfait en centre-ville ! Tout à portée de main.",
                    "created_at": "2025-07-18"
                },
                {
                    "id": "rev4",
                    "user_name": "Tapis Bernard",
                    "rating": 4,
                    "comment": "Appartement moderne et bien situé, parfait pour un séjour urbain.",
                    "created_at": "2025-07-12"
                }
            ]
        },
        "studio-building": {
            "id": "studio-building",
            "name": "Studio dans un Building",
            "price": 100,
            "description": "Studio élégant dans un immeuble moderne avec toutes les commodités. Design contemporain et équipements haut de gamme pour un séjour confortable.",
            "location": "Quartier moderne",
            "image": "https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0",
            "amenities": ["WiFi fibre", "Salle de sport", "Concierge", "Terrasse commune", "Sécurité 24h/24", "Ascenseur"],
            "reviews": [
                {
                    "id": "rev5",
                    "user_name": "James Lebrun",
                    "rating": 4,
                    "comment": "Studio moderne et bien équipé ! Le building est magnifique.",
                    "created_at": "2025-07-22"
                },
                {
                    "id": "rev6",
                    "user_name": "Jackson Michel",
                    "rating": 5,
                    "comment": "Parfait pour un séjour d'affaires, très professionnel.",
                    "created_at": "2025-07-10"
                }
            ]
        },
        "logement-naturel": {
            "id": "logement-naturel",
            "name": "Logement Naturel",
            "price": 100,
            "description": "Échappez-vous dans ce logement en pleine nature, calme et ressourçant. Parfait pour se déconnecter du stress urbain et retrouver la sérénité.",
            "location": "Pleine nature",
            "image": "https://offloadmedia.feverup.com/lyonsecret.com/wp-content/uploads/2021/06/29070343/shutterstock_1531738394-1-1024x683.jpg",
            "amenities": ["Vue panoramique", "Cheminée", "Jardin privé", "Barbecue", "Randonnées à proximité", "Air pur"],
            "reviews": [
                {
                    "id": "rev7",
                    "user_name": "Gérard Moreau",
                    "rating": 5,
                    "comment": "Cadre magnifique, très reposant ! La nature à perte de vue.",
                    "created_at": "2025-07-25"
                },
                {
                    "id": "rev8",
                    "user_name": "Thomas Verdier",
                    "rating": 5,
                    "comment": "Parfait pour une déconnexion totale, je recommande vivement.",
                    "created_at": "2025-07-14"
                }
            ]
        },
        "villa-piscine": {
            "id": "villa-piscine",
            "name": "Villa avec Piscine",
            "price": 200,
            "description": "Magnifique villa avec piscine privée, idéale pour des vacances de rêve. Luxe et détente garantis dans un cadre exceptionnel.",
            "location": "Bord de mer",
            "image": "https://th.bing.com/th/id/R.870bb196d67e6dd3f9c7b091a4477db6?rik=RFL%2bguP6w8DTWA&riu=http%3a%2f%2fwww.gordes-luberon.com%2fztock%2fgordes-luberon-location-piscine.jpg",
            "amenities": ["Piscine privée", "Jacuzzi", "Cuisine chef", "Service ménage", "Jardins paysagers", "Terrasse panoramique"],
            "reviews": [
                {
                    "id": "rev9",
                    "user_name": "Emmanuel Petit",
                    "rating": 5,
                    "comment": "Villa de rêve ! Piscine magnifique et vue imprenable !",
                    "created_at": "2025-07-28"
                },
                {
                    "id": "rev10",
                    "user_name": "Chloé Garnier",
                    "rating": 5,
                    "comment": "Vacances parfaites, la villa dépasse toutes les attentes.",
                    "created_at": "2025-07-11"
                }
            ]
        },
        "logement-luxe": {
            "id": "logement-luxe",
            "name": "Logement de Luxe",
            "price": 200,
            "description": "Expérience haut de gamme dans ce logement luxueux avec services premium. Le summum du raffinement et de l'élégance pour un séjour d'exception.",
            "location": "Quartier huppé",
            "image": "https://th.bing.com/th/id/R.71168989b965ab7a44303873f6d662e1?rik=Qan76jaH30nDSw&pid=ImgRaw&r=0",
            "amenities": ["Conciergerie", "Spa privé", "Chef à domicile", "Chauffeur", "Service premium 24h/24", "Vue panoramique"],
            "reviews": [
                {
                    "id": "rev11",
                    "user_name": "Kevin Durand",
                    "rating": 5,
                    "comment": "Service exceptionnel, luxe absolu ! Une expérience inoubliable.",
                    "created_at": "2025-07-30"
                },
                {
                    "id": "rev12",
                    "user_name": "Ousmane Dembélé",
                    "rating": 5,
                    "comment": "Le summum du raffinement, tout était parfait.",
                    "created_at": "2025-07-08"
                }
            ]
        },
        "logement-atypique": {
            "id": "logement-atypique",
            "name": "Logement Atypique",
            "price": 200,
            "description": "Logement unique et original pour une expérience inoubliable et authentique. Architecture surprenante et caractère unique pour les voyageurs en quête d'originalité.",
            "location": "Lieu unique",
            "image": "https://th.bing.com/th/id/R.a9f34fe1621bc5b434560f2108eea67c?rik=35e6%2fBt8noSMEA&pid=ImgRaw&r=0",
            "amenities": ["Architecture unique", "Design original", "Expérience authentique", "Cadre exceptionnel", "Séjour mémorable", "Originalité garantie"],
            "reviews": [
                {
                    "id": "rev13",
                    "user_name": "Marie Dubois",
                    "rating": 4,
                    "comment": "Expérience vraiment unique ! Architecture fascinante.",
                    "created_at": "2025-07-26"
                },
                {
                    "id": "rev14",
                    "user_name": "Pierre Martin",
                    "rating": 5,
                    "comment": "Séjour inoubliable, jamais vu quelque chose d'aussi original !",
                    "created_at": "2025-07-13"
                }
            ]
        }
    }
    
    if place_id in places_details:
        return jsonify(places_details[place_id]), 200
    else:
        return jsonify({'error': 'Place not found'}), 404

@app.route('/api/v1/places/<place_id>/reviews', methods=['POST'])
def add_review(place_id):
    # Vérifier l'authentification
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authentication required'}), 401
    
    # Extraire le token (simulation simple)
    token = auth_header.split(' ')[1]
    if not token.startswith('token-'):
        return jsonify({'error': 'Invalid token'}), 401
    
    # Vérifier que le lieu existe
    places_list = ["logement-occasion", "appartement-ville", "studio-building", 
                   "logement-naturel", "villa-piscine", "logement-luxe", "logement-atypique"]
    
    if place_id not in places_list:
        return jsonify({'error': 'Place not found'}), 404
    
    # Récupérer les données de l'avis
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    review_text = data.get('text', '').strip()
    rating = data.get('rating')
    
    # Validation
    if not review_text:
        return jsonify({'error': 'Review text is required'}), 400
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
    
    # Simuler l'ajout de l'avis (en réalité, on l'ajouterait à la base de données)
    # Extraire l'ID utilisateur du token
    user_id = token.split('-')[1]
    
    new_review = {
        'id': f'rev-{place_id}-{len(review_text)}',  # ID simple pour la simulation
        'user_name': f'User-{user_id}',
        'rating': rating,
        'comment': review_text,
        'created_at': '2025-08-01',  # Date actuelle
        'place_id': place_id
    }
    
    # Simuler le succès
    return jsonify({
        'message': 'Review added successfully',
        'review': new_review
    }), 201

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Server is running!'}), 200

if __name__ == '__main__':
    print("🚀 Initialisation de la base de données...")
    init_db()
    print("🌐 Serveur démarré sur http://localhost:5000")
    print("📧 Utilisateur de test: test@hbnb.com")
    print("🔑 Mot de passe: password123")
    app.run(debug=True, host='0.0.0.0', port=5000)
