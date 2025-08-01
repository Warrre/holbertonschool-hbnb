# Simple HBnB
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import urllib.parse
import time
import os

# Base de données simulée
users_db = {
    'test@hbnb.com': {'password': 'password123', 'name': 'Utilisateur Test'},
    'demo@hbnb.com': {'password': 'demo123', 'name': 'Demo User'},
    'admin@hbnb.com': {'password': 'admin123', 'name': 'Administrateur'},
    'user@example.com': {'password': 'user123', 'name': 'John Doe'},
    'guest@hbnb.com': {'password': 'guest123', 'name': 'Invité'}
}

reviews_db = []

class HBnBHandler(SimpleHTTPRequestHandler):
    
    def do_POST(self):
        if self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/reviews':
            self.handle_add_review()
        else:
            self.send_error(404)
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # Servir les fichiers statiques
            super().do_GET()
    
    def handle_login(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            email = data.get('email')
            password = data.get('password')
            
            if email in users_db and users_db[email]['password'] == password:
                token = f"token_{email}_{int(time.time())}"
                user_name = users_db[email]['name']
                
                response = {
                    'success': True,
                    'token': token,
                    'user_name': user_name,
                    'message': f'Bienvenue, {user_name}!'
                }
                self.send_cors_response(200, response)
            else:
                self.send_cors_response(401, {'error': 'Email ou mot de passe incorrect'})
                
        except Exception as e:
            print(f"Erreur login: {e}")
            self.send_cors_response(500, {'error': 'Erreur serveur'})
    
    def handle_add_review(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            place_id = data.get('place_id')
            comment = data.get('comment')
            rating = data.get('rating')
            user_name = data.get('user_name')
            
            if all([place_id, comment, rating, user_name]):
                new_review = {
                    'id': len(reviews_db) + 1,
                    'place_id': place_id,
                    'comment': comment,
                    'rating': rating,
                    'user': user_name,
                    'timestamp': int(time.time())
                }
                
                reviews_db.append(new_review)
                
                self.send_cors_response(200, {
                    'success': True,
                    'message': 'Commentaire ajouté avec succès',
                    'review': new_review
                })
            else:
                self.send_cors_response(400, {'error': 'Données manquantes'})
                
        except Exception as e:
            print(f"Erreur ajout review: {e}")
            self.send_cors_response(500, {'error': 'Erreur serveur'})
    
    def handle_api_get(self):
        if self.path == '/api/places':
            places = [
                {'id': 'logement-occasion', 'name': 'Logement d\'Occasion', 'price': '$50'},
                {'id': 'appartement-ville', 'name': 'Appartement en Ville', 'price': '$75'},
                {'id': 'studio-building', 'name': 'Studio dans un Building', 'price': '$100'}
            ]
            self.send_cors_response(200, {'places': places})
        elif self.path.startswith('/api/reviews?'):
            # Récupérer les avis pour un lieu spécifique
            query_params = urllib.parse.parse_qs(self.path.split('?')[1])
            place_id = query_params.get('place_id', [None])[0]
            
            if place_id:
                place_reviews = [review for review in reviews_db if review['place_id'] == place_id]
                self.send_cors_response(200, {'reviews': place_reviews})
            else:
                self.send_cors_response(200, {'reviews': reviews_db})
        else:
            self.send_cors_response(404, {'error': 'Endpoint non trouvé'})
    
    def send_cors_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response_json = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def do_OPTIONS(self):
        # Gérer les requêtes OPTIONS pour CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('localhost', port), HBnBHandler)
    
    print("🚀 Serveur HBnB Simple démarré")
    print(f"🌐 Accessible sur http://localhost:{port}")
    print("\n📱 Comptes de test:")
    for email, info in users_db.items():
        print(f"   📧 {email} | 🔑 {info['password']} | 👤 {info['name']}")
    
    print(f"\n💬 {len(reviews_db)} commentaires en base")
    print("=" * 50)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur...")
        server.server_close()
