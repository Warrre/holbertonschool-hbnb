# Enhanced HBnB
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import time
import os

app = Flask(__name__)
CORS(app)

# Base de données simulée pour les utilisateurs
users_db = {
    'test@hbnb.com': {'password': 'password123', 'name': 'Utilisateur Test'},
    'demo@hbnb.com': {'password': 'demo123', 'name': 'Demo User'},
    'admin@hbnb.com': {'password': 'admin123', 'name': 'Administrateur'},
    'user@example.com': {'password': 'user123', 'name': 'John Doe'},
    'guest@hbnb.com': {'password': 'guest123', 'name': 'Invité'},
    'marie@hbnb.com': {'password': 'marie123', 'name': 'Marie Dubois'},
    'pierre@hbnb.com': {'password': 'pierre123', 'name': 'Pierre Martin'}
}

# Base de données pour les commentaires
reviews_db = []

# Données des logements
places_data = {
    'logement-occasion': {
        'name': 'Logement d\'Occasion',
        'host': 'juna Lartego',
        'price': '$50 / nuit',
        'mainImage': 'https://cdn.generationvoyage.fr/2022/02/logement-2-1.png',
        'description': 'Logement confortable et abordable, parfait pour un séjour économique.',
        'amenities': ['WiFi gratuit', 'Cuisine équipée', 'Parking gratuit'],
        'reviews': [
            {'comment': 'Très bon rapport qualité-prix !', 'user': 'Harry Kane', 'rating': 4},
            {'comment': 'Parfait pour un budget serré !', 'user': 'Sané Leroy', 'rating': 4}
        ]
    },
    'appartement-ville': {
        'name': 'Appartement en Ville',
        'host': 'Laurent Leblanc',
        'price': '$75 / nuit',
        'mainImage': 'https://cdn.generationvoyage.fr/2022/02/logement-7-1.png',
        'description': 'Logement moderne au cœur de la ville, proche de tous les commerces.',
        'amenities': ['WiFi haut débit', 'Cuisine moderne', 'Balcon'],
        'reviews': [
            {'comment': 'Emplacement parfait en centre-ville !', 'user': 'William Rousseau', 'rating': 5}
        ]
    },
    'studio-building': {
        'name': 'Studio dans un Building',
        'host': 'Anna Kowalski',
        'price': '$100 / nuit',
        'mainImage': 'https://th.bing.com/th/id/R.8bdb31a1d24ce6b8916e49f2292de543?rik=y6HoIDR9%2fA95iw&pid=ImgRaw&r=0',
        'description': 'Studio élégant dans un immeuble moderne avec toutes les commodités.',
        'amenities': ['WiFi fibre', 'Salle de sport', 'Concierge'],
        'reviews': [
            {'comment': 'Studio parfait avec de superbes équipements !', 'user': 'Marie Dubois', 'rating': 5}
        ]
    }
}

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# ======= AUTHENTIFICATION =======

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        print(f"🔐 Tentative de connexion pour: {email}")
        
        # Vérifications basiques
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        if email in users_db and users_db[email]['password'] == password:
            # Générer un token simple (pour la production, utilisez JWT)
            token = f"token_{email}_{int(time.time())}"
            user_name = users_db[email]['name']
            
            print(f"✅ Connexion réussie pour: {user_name}")
            return jsonify({
                'success': True,
                'token': token,
                'user_name': user_name,
                'message': f'Bienvenue, {user_name}!'
            })
        else:
            print(f"❌ Identifiants incorrects pour: {email}")
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/users/info')
def get_users_info():
    """Endpoint pour obtenir la liste des comptes de test"""
    return jsonify({
        'message': 'Comptes de test disponibles',
        'accounts': [
            {'email': 'test@hbnb.com', 'password': 'password123', 'name': 'Utilisateur Test'},
            {'email': 'demo@hbnb.com', 'password': 'demo123', 'name': 'Demo User'},
            {'email': 'admin@hbnb.com', 'password': 'admin123', 'name': 'Administrateur'},
            {'email': 'user@example.com', 'password': 'user123', 'name': 'John Doe'},
            {'email': 'guest@hbnb.com', 'password': 'guest123', 'name': 'Invité'}
        ]
    })

# ======= LOGEMENTS =======

@app.route('/api/places')
def get_places():
    """Récupérer tous les logements"""
    try:
        places_list = []
        for place_id, place_data in places_data.items():
            places_list.append({
                'id': place_id,
                'name': place_data['name'],
                'host': place_data['host'],
                'price': place_data['price'],
                'image': place_data['mainImage'],
                'description': place_data['description'][:100] + '...',
                'amenities_count': len(place_data['amenities']),
                'reviews_count': len(place_data['reviews'])
            })
        
        print(f"📋 Envoi de {len(places_list)} logements")
        return jsonify({'places': places_list})
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des logements: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/places/<place_id>')
def get_place_details(place_id):
    """Récupérer les détails d'un logement spécifique"""
    try:
        if place_id not in places_data:
            return jsonify({'error': 'Logement introuvable'}), 404
        
        place = places_data[place_id]
        place_details = {
            'id': place_id,
            'name': place['name'],
            'host': place['host'],
            'price': place['price'],
            'mainImage': place['mainImage'],
            'description': place['description'],
            'amenities': place['amenities'],
            'reviews': place['reviews']
        }
        
        print(f"🏠 Envoi des détails du logement: {place['name']}")
        return jsonify(place_details)
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération du logement {place_id}: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

# ======= COMMENTAIRES =======

@app.route('/api/reviews', methods=['POST'])
def add_review():
    """Ajouter un nouveau commentaire"""
    try:
        data = request.get_json()
        
        # Vérifier l'authentification (basique pour la démo)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token d\'authentification requis'}), 401
        
        # Données du commentaire
        place_id = data.get('place_id')
        comment = data.get('comment')
        rating = data.get('rating')
        user_name = data.get('user_name')
        
        # Validations
        if not all([place_id, comment, rating, user_name]):
            return jsonify({'error': 'Tous les champs sont requis'}), 400
        
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'La note doit être entre 1 et 5'}), 400
        
        if len(comment.strip()) < 10:
            return jsonify({'error': 'Le commentaire doit contenir au moins 10 caractères'}), 400
        
        # Créer le nouveau commentaire
        new_review = {
            'id': len(reviews_db) + 1,
            'place_id': place_id,
            'comment': comment.strip(),
            'rating': rating,
            'user': user_name,
            'timestamp': int(time.time()),
            'formatted_rating': f"{'★' * rating}{'☆' * (5 - rating)} {rating}/5"
        }
        
        # Ajouter à la base de données
        reviews_db.append(new_review)
        
        # Ajouter au logement si il existe
        if place_id in places_data:
            places_data[place_id]['reviews'].append({
                'comment': comment.strip(),
                'user': user_name,
                'rating': f"{'★' * rating}{'☆' * (5 - rating)} {rating}/5"
            })
        
        print(f"💬 Nouveau commentaire ajouté par {user_name} pour {place_id} (note: {rating}/5)")
        return jsonify({
            'success': True,
            'message': 'Commentaire ajouté avec succès',
            'review': new_review
        })
        
    except Exception as e:
        print(f"❌ Erreur lors de l'ajout du commentaire: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/reviews/<place_id>')
def get_reviews(place_id):
    """Récupérer tous les commentaires d'un logement"""
    try:
        place_reviews = [review for review in reviews_db if review['place_id'] == place_id]
        
        print(f"💬 Envoi de {len(place_reviews)} commentaires pour {place_id}")
        return jsonify({
            'reviews': place_reviews,
            'count': len(place_reviews)
        })
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des commentaires: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/reviews/user/<user_name>')
def get_user_reviews(user_name):
    """Récupérer tous les commentaires d'un utilisateur"""
    try:
        user_reviews = [review for review in reviews_db if review['user'] == user_name]
        
        print(f"👤 Envoi de {len(user_reviews)} commentaires de {user_name}")
        return jsonify({
            'reviews': user_reviews,
            'count': len(user_reviews)
        })
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des commentaires utilisateur: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

# ======= STATS ET INFOS =======

@app.route('/api/stats')
def get_stats():
    """Statistiques globales de l'application"""
    try:
        stats = {
            'total_places': len(places_data),
            'total_reviews': len(reviews_db),
            'registered_users': len(users_db),
            'average_rating': 0
        }
        
        # Calculer la note moyenne
        if reviews_db:
            total_rating = sum(review['rating'] for review in reviews_db)
            stats['average_rating'] = round(total_rating / len(reviews_db), 2)
        
        return jsonify(stats)
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des stats: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

# ======= GESTION DES ERREURS =======

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint non trouvé'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erreur serveur interne'}), 500

if __name__ == '__main__':
    print("🚀 Démarrage du serveur HBnB Enhanced...")
    print("📱 Comptes de test disponibles:")
    for email, info in users_db.items():
        print(f"   📧 {email} | 🔑 {info['password']} | 👤 {info['name']}")
    
    print(f"🏠 {len(places_data)} logements disponibles")
    print(f"💬 {len(reviews_db)} commentaires en base")
    print("🌐 Serveur accessible sur http://localhost:8000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=True)
