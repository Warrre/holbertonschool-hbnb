# Serveur HTTP avec API de login simple
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import urllib.parse

# Base de données des utilisateurs
users_db = {
    'test@hbnb.com': {'password': 'password123', 'name': 'Utilisateur Test'},
    'demo@hbnb.com': {'password': 'demo123', 'name': 'Demo User'},
    'admin@hbnb.com': {'password': 'admin123', 'name': 'Administrateur'},
    'user@example.com': {'password': 'user123', 'name': 'John Doe'},
    'guest@hbnb.com': {'password': 'guest123', 'name': 'Invité'},
    'marie@hbnb.com': {'password': 'marie123', 'name': 'Marie Dubois'},
    'pierre@hbnb.com': {'password': 'pierre123', 'name': 'Pierre Martin'}
}

# Base de données des commentaires
reviews_db = []

class HBnBHandler(SimpleHTTPRequestHandler):
    
    def do_GET(self):
        # Gérer les requêtes API GET
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # Servir les fichiers statiques normalement
            if self.path == '/' or self.path == '/index.html':
                self.path = '/index.html'
            return super().do_GET()
    
    def handle_api_get(self):
        if self.path.startswith('/api/reviews'):
            # Retourner tous les commentaires ou filtrés par place_id
            try:
                # Extraire le paramètre place_id si présent
                place_id_filter = None
                if '?' in self.path:
                    query_string = self.path.split('?')[1]
                    params = urllib.parse.parse_qs(query_string)
                    if 'place_id' in params:
                        place_id_filter = params['place_id'][0]
                
                # Filtrer les commentaires si nécessaire
                if place_id_filter:
                    filtered_reviews = [r for r in reviews_db if r.get('place_id') == place_id_filter]
                    print(f"📋 Récupération de {len(filtered_reviews)} commentaires pour {place_id_filter}")
                else:
                    filtered_reviews = reviews_db
                    print(f"📋 Récupération de tous les {len(filtered_reviews)} commentaires")
                
                response = {
                    'success': True,
                    'reviews': filtered_reviews,
                    'count': len(filtered_reviews)
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                print(f"❌ Erreur: {e}")
                response = {'error': 'Erreur serveur'}
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404)
    
    def do_POST(self):
        # Gérer l'API de login et reviews
        if self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/reviews':
            self.handle_add_review()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        # Gérer les requêtes preflight CORS
        self.send_response(200)
        self.end_headers()
    
    def handle_login(self):
        try:
            # Lire les données POST
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            email = data.get('email')
            password = data.get('password')
            
            print(f"🔐 Tentative de connexion pour: {email}")
            
            # Vérifier les identifiants
            if email in users_db and users_db[email]['password'] == password:
                # Connexion réussie
                user_name = users_db[email]['name']
                token = f"token_{email.replace('@', '_').replace('.', '_')}"
                
                response = {
                    'success': True,
                    'token': token,
                    'user_name': user_name,
                    'message': f'Bienvenue, {user_name}!'
                }
                
                print(f"✅ Connexion réussie pour: {user_name}")
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            else:
                # Identifiants incorrects
                response = {'error': 'Email ou mot de passe incorrect'}
                print(f"❌ Identifiants incorrects pour: {email}")
                
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            response = {'error': 'Erreur serveur'}
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def handle_add_review(self):
        try:
            # Lire les données POST
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Récupérer les données du commentaire
            place_id = data.get('place_id')
            comment = data.get('comment')
            rating = data.get('rating')
            user_name = data.get('user_name')
            
            print(f"💬 Nouveau commentaire de {user_name} pour {place_id}")
            
            # Validations basiques
            if not all([place_id, comment, rating, user_name]):
                response = {'error': 'Tous les champs sont requis'}
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                response = {'error': 'La note doit être entre 1 et 5'}
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            if len(comment.strip()) < 10:
                response = {'error': 'Le commentaire doit contenir au moins 10 caractères'}
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            # Ajouter le commentaire à la base de données
            new_review = {
                'id': len(reviews_db) + 1,
                'place_id': place_id,
                'user_name': user_name,
                'comment': comment.strip(),
                'rating': rating,
                'timestamp': int(__import__('time').time())
            }
            
            reviews_db.append(new_review)
            
            response = {
                'success': True,
                'message': 'Commentaire ajouté avec succès',
                'review': new_review
            }
            
            print(f"✅ Commentaire ajouté: {comment[:50]}...")
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout du commentaire: {e}")
            response = {'error': 'Erreur serveur'}
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def end_headers(self):
        # Ajouter les headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('localhost', port), HBnBHandler)
    
    print(f"🚀 Serveur HBnB simple sur http://localhost:{port}")
    print("📱 Comptes test :")
    print("   demo@hbnb.com / demo123")
    print("   test@hbnb.com / test123")
    print("   user@hbnb.com / user123")
    print("=" * 40)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Serveur arrêté")
        server.server_close()
